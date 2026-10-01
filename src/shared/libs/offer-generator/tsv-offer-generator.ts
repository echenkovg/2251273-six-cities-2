import { OfferGenerator } from './offer-generator.interface.js';
import { MockServerDataType, OffersItemType } from './../../types/index.type.js';
import {
  getRandomValue,
  getRandomItem,
  getRandomItems,
} from './../../helpers/index.js';
import {
  OFFER_PRICE,
  OFFER_RATING,
  OFFER_BEDROOMS,
  OFFER_ADULTS,
  OFFER_GOODS,
  OFFER_IMAGES,
} from './../../const.js';
import { TSVFormatter } from '../tsv-formatter/tsv-formatter.js';

const COORD_JITTER = 0.02;

function jitter(base: number, amplitude: number = COORD_JITTER): number {
  return base + (Math.random() - 0.5) * amplitude;
}

export class TSVOfferGenerator implements OfferGenerator {
  private readonly formatter = new TSVFormatter();

  constructor(private readonly mockData: MockServerDataType) {}

  public generate(): string {
    const {
      titles,
      types,
      cites,
      locations,
      previewImages,
      descriptions,
      goods,
      images,
      users,
    } = this.mockData;

    const title = getRandomItem(titles);
    const type = getRandomItem(types);
    const cityName = getRandomItem(cites);
    const previewImage = getRandomItem(previewImages);

    const cityLocation = locations[cityName] ?? {
      latitude: 0,
      longitude: 0,
      zoom: 0,
    };

    const price = getRandomValue(OFFER_PRICE.min, OFFER_PRICE.max);
    const rating = Number(getRandomValue(OFFER_RATING.min, OFFER_RATING.max, 1).toFixed(1));
    const isFavorite = getRandomItem([true, false]);
    const isPremium = getRandomItem([true, false]);
    const description = getRandomItem(descriptions);
    const bedrooms = getRandomValue(OFFER_BEDROOMS.min, OFFER_BEDROOMS.max);
    const offerGoods = getRandomItems(goods, getRandomValue(OFFER_GOODS.min, OFFER_GOODS.max), true);
    const offerImages = getRandomItems(images, getRandomValue(OFFER_IMAGES.min, OFFER_IMAGES.max), true);
    const userList = Object.values(users);
    const user = getRandomItem(userList);
    const maxAdults = getRandomValue(OFFER_ADULTS.min, OFFER_ADULTS.max);

    const offer: OffersItemType = {
      title,
      type,
      price,
      previewImage,
      city: {
        name: cityName,
        location: {
          latitude: cityLocation.latitude,
          longitude: cityLocation.longitude,
          zoom: cityLocation.zoom,
        },
      },
      location: {
        latitude: jitter(cityLocation.latitude),
        longitude: jitter(cityLocation.longitude),
        zoom: cityLocation.zoom,
      },
      isFavorite,
      isPremium,
      rating,
      description,
      bedrooms,
      goods: offerGoods,
      host: {
        name: user.name,
        avatarUrl: user.avatarUrl,
        isPro: user.isPro,
      },
      images: offerImages,
      maxAdults: maxAdults,
    };

    return this.formatter.format(offer);
  }
}
