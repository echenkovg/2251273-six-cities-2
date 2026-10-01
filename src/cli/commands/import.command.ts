import { Command } from './command.interface.js';
import { TSVFileReader } from '../../shared/libs/file-reader/index.js';
import { TSVParser } from '../../shared/libs/tsv-parser/index.js';
import { OfferModel } from '../../shared/modules/offer/offer.entity.js';
import { UserModel, DEFAULT_AVATAR_URL } from '../../shared/modules/user/user.entity.js';
import { inject, injectable } from 'inversify';
import { TYPES } from '../../shared/libs/container/index.js';
import { LoggerInterface } from '../../shared/libs/logger/index.js';
import { DatabaseClientInterface } from '../../shared/libs/database/index.js';
import { OffersItemType } from '../../shared/types/index.type.js';
import { CityName, CreateOffer, OfferType } from '../../shared/modules/offer/index.js';
import { OFFER_GOODS, OfferGood } from '../../shared/modules/offer/offer.dto.js';
import { hashPassword } from './../../shared/helpers/password.helper.js';

const OFFER_IMAGES_COUNT = 6;

const DEFAULT_OFFER_IMAGES = [
  '/img/offers/preview-1.jpg',
  '/img/offers/preview-2.jpg',
  '/img/offers/preview-3.jpg',
  '/img/offers/preview-4.jpg',
  '/img/offers/preview-5.jpg',
  '/img/offers/preview-6.jpg',
];

const INVALID_URL_PREFIXES = [
  'https://static.example.com',
  'http://static.example.com',
  'https://example.com',
  'http://example.com',
];

/**
 * Проверяет, пригоден ли URL для использования.
 */
function isUsableUrl(url: string | undefined): boolean {
  if (typeof url !== 'string' || url.trim() === '') {
    return false;
  }
  const trimmed = url.trim();
  return !INVALID_URL_PREFIXES.some((prefix) => trimmed.startsWith(prefix));
}

/**
 * Возвращает дефолтный набор из 6 картинок, сдвинутый на `index`.
 */
function defaultImagesFromIndex(index: number): string[] {
  const start = index % DEFAULT_OFFER_IMAGES.length;
  const result: string[] = [];
  for (let i = 0; i < OFFER_IMAGES_COUNT; i += 1) {
    result.push(DEFAULT_OFFER_IMAGES[(start + i) % DEFAULT_OFFER_IMAGES.length]);
  }
  return result;
}

/**
 * Готовит массив из ровно 6 картинок.
 */
function resolveImages(raw: string[], index: number): string[] {
  const valid = (raw ?? []).filter(isUsableUrl);

  if (valid.length >= OFFER_IMAGES_COUNT) {
    return valid.slice(0, OFFER_IMAGES_COUNT);
  }

  const fallback = defaultImagesFromIndex(index);
  const result = [...valid];
  let i = 0;
  while (result.length < OFFER_IMAGES_COUNT) {
    result.push(fallback[i % fallback.length]);
    i += 1;
  }
  return result;
}

/**
 * Готовит превью оффера.
 */
function resolvePreviewImage(raw: string | undefined, index: number): string {
  if (isUsableUrl(raw)) {
    return raw!.trim();
  }
  return DEFAULT_OFFER_IMAGES[index % DEFAULT_OFFER_IMAGES.length];
}

/**
 * Готовит аватар хоста.
 */
function resolveAvatarUrl(raw: string | undefined): string {
  return isUsableUrl(raw) ? raw!.trim() : DEFAULT_AVATAR_URL;
}

/**
 * Приводит массив строк из TSV к массиву допустимых удобств.
 */
function toOfferGoods(raw: string[]): OfferGood[] {
  const allowed = new Set<string>(OFFER_GOODS);
  return raw.filter((good): good is OfferGood => allowed.has(good));
}

/**
 * Генерирует email из имени пользователя.
 */
function toEmail(name: string): string {
  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '.')
    .replace(/^\.|\.$/g, '');
  return `${slug}@example.com`;
}

@injectable()
export class ImportCommand implements Command {
  constructor(
    @inject(TYPES.Logger) private readonly logger: LoggerInterface,
    @inject(TYPES.DatabaseClient) private readonly databaseClient: DatabaseClientInterface,
  ) {}

  public getName(): string {
    return '--import';
  }

  public async execute(...parameters: string[]): Promise<void> {
    const filename = parameters[0]?.trim();
    if (!filename) {
      this.logger.error('ImportCommand: Filename is required. Usage: --import <path-to-file.tsv>');
      return;
    }

    try {
      await this.databaseClient.connect();

      const reader = new TSVFileReader(filename, new TSVParser(), this.logger);
      const data = await reader.read();

      if (!data || data.length === 0) {
        this.logger.warn('ImportCommand: No valid records found in the file.');
        return;
      }

      let upserted = 0;
      let errors = 0;

      for (let i = 0; i < data.length; i++) {
        const item = data[i];
        const recordNumber = i + 1;
        const offerTitle = typeof item.title === 'string' ? item.title : 'Untitled';

        try {
          await this.saveOffer(item, i);
          upserted++;
        } catch (err) {
          errors++;
          this.logger.error(
            err as Error,
            `ImportCommand: Line #${recordNumber} ("${offerTitle}") skipped.`,
          );
        }
      }

      this.logger.info(
        `ImportCommand: Upserted ${upserted} record(s). Errors: ${errors}.`,
      );

      if (errors === 0) {
        this.logger.info('ImportCommand: Import completed successfully without errors.');
      } else {
        this.logger.warn(`ImportCommand: Import finished with ${errors} error(s).`);
      }
    } catch (err) {
      this.logger.error(err as Error, 'ImportCommand: Critical error during import');
    } finally {
      await this.databaseClient.disconnect();
      this.logger.info('ImportCommand: Database connection closed.');
    }
  }

  private async saveOffer(item: OffersItemType, index: number): Promise<void> {
    const {
      title,
      type,
      price,
      previewImage,
      city: {
        name: cityName,
        location: { latitude: cityLatitude, longitude: cityLongitude, zoom: cityZoom },
      },
      location: {
        latitude: offerLatitude,
        longitude: offerLongitude,
        zoom: offerZoom,
      },
      isPremium,
      description,
      bedrooms,
      goods: offerGoodsRaw,
      host: {
        name: userName,
        avatarUrl: userAvatarUrl,
        isPro: userIsPro,
      },
      images,
      maxAdults,
      rating, // ← добавлено: рейтинг приходит из TSV
    } = item;

    const user = await this.findOrCreateUser(userName, userAvatarUrl, userIsPro);

    const offerData: CreateOffer = {
      title,
      type: type as OfferType,
      price,
      previewImage: resolvePreviewImage(previewImage, index),
      cityName: cityName as CityName,
      cityLatitude,
      cityLongitude,
      cityZoom,
      offerLatitude,
      offerLongitude,
      offerZoom,
      isPremium,
      description,
      bedrooms,
      offerGoods: toOfferGoods(offerGoodsRaw),
      user: user._id,
      images: resolveImages(images, index),
      maxAdults,
      rating: typeof rating === 'number' ? rating : 0, // ← добавлено
    };

    await OfferModel.create(offerData);
  }

  private async findOrCreateUser(
    name: string,
    avatarUrl: string,
    isPro: boolean,
  ) {
    const email = toEmail(name);

    let user = await UserModel.findOne({ email }).exec();

    if (!user) {
      const hashedPassword = await hashPassword('default-password');

      user = await UserModel.create({
        name,
        email,
        password: hashedPassword,
        avatarUrl: resolveAvatarUrl(avatarUrl),
        type: isPro ? 'pro' : 'regular',
      });
      this.logger.info(`ImportCommand: Created user ${email}`);
    }

    return user;
  }
}
