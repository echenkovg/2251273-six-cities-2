import { FormEvent, useCallback, useState } from 'react';
import Select from 'react-select';

import { City, CityName, NewOffer, Offer, Type } from '../../types/types';

import LocationPicker from '../location-picker/location-picker';
import {
  CITIES, CityLocation, GOODS, TYPES, DEFAULT_CITY_ZOOM, DEFAULT_OFFER_ZOOM,
} from '../../const';
import { capitalize } from '../../utils';

enum FormFieldName {
  title = 'title',
  description = 'description',
  cityName = 'cityName',
  previewImage = 'previewImage',
  isPremium = 'isPremium',
  type = 'type',
  bedrooms = 'bedrooms',
  maxAdults = 'maxAdults',
  price = 'price',
  good = 'good-',
  image = 'image',
}

const getGoods = (
  entries: IterableIterator<[string, FormDataEntryValue]>,
): string[] => {
  const chosenGoods: string[] = [];
  for (const entry of entries) {
    if (entry[0].startsWith(FormFieldName.good)) {
      chosenGoods.push(entry[0].slice(FormFieldName.good.length));
    }
  }
  return chosenGoods;
};

const getImages = (
  entries: IterableIterator<[string, FormDataEntryValue]>,
): string[] => {
  const enteredImages: string[] = [];
  for (const entry of entries) {
    if (entry[0].startsWith(FormFieldName.image) && typeof entry[1] === 'string') {
      enteredImages.push(entry[1]);
    }
  }
  return enteredImages;
};

type OfferFormProps<T> = {
  offer: T;
  onSubmit: (offerData: T) => void;
};

const OfferForm = <T extends Offer | NewOffer>({
  offer,
  onSubmit,
}: OfferFormProps<T>): JSX.Element => {
  const {
    title, description, cityName, previewImage, isPremium, type,
    bedrooms, maxAdults, price, offerGoods: chosenGoods,
    offerLatitude, offerLongitude, images,
  } = offer;

  const [chosenCity, setChosenCity] = useState<CityName>(cityName);
  const [chosenLocation, setChosenLocation] = useState({
    latitude: offerLatitude,
    longitude: offerLongitude,
    zoom: DEFAULT_OFFER_ZOOM,
  });

  const handleCityChange = (value: CityName) => {
    setChosenCity(value);
    setChosenLocation({
      latitude: CityLocation[value].latitude,
      longitude: CityLocation[value].longitude,
      zoom: DEFAULT_OFFER_ZOOM,
    });
  };

  const handleLocationChange = useCallback(
    ({ lat, lng }: { lat: number; lng: number }) => {
      setChosenLocation({ latitude: lat, longitude: lng, zoom: DEFAULT_OFFER_ZOOM });
    },
    [],
  );

  const handleFormSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    const cityLoc = CityLocation[chosenCity];

    const data = {
      ...offer,
      title: String(formData.get(FormFieldName.title)),
      description: String(formData.get(FormFieldName.description)),
      cityName: chosenCity,
      cityLatitude: cityLoc.latitude,
      cityLongitude: cityLoc.longitude,
      cityZoom: DEFAULT_CITY_ZOOM,
      offerLatitude: chosenLocation.latitude,
      offerLongitude: chosenLocation.longitude,
      offerZoom: DEFAULT_OFFER_ZOOM,
      previewImage: String(formData.get(FormFieldName.previewImage)),
      isPremium: Boolean(formData.get(FormFieldName.isPremium)),
      type: String(formData.get(FormFieldName.type)) as Type,
      bedrooms: Number(formData.get(FormFieldName.bedrooms)),
      maxAdults: Number(formData.get(FormFieldName.maxAdults)),
      price: Number(formData.get(FormFieldName.price)),
      offerGoods: getGoods(formData.entries()),
      images: getImages(formData.entries()),
    };

    onSubmit(data);
  };

  const city: City = {
    name: chosenCity,
    location: {
      latitude: CityLocation[chosenCity].latitude,
      longitude: CityLocation[chosenCity].longitude,
      zoom: DEFAULT_CITY_ZOOM,
    },
  };

  return (
    <form className="form offer-form" action="#" method="post" onSubmit={handleFormSubmit}>
      <fieldset className="title-fieldset">
        <div className="form__input-wrapper">
          <label htmlFor="title" className="title-fieldset__label">Title</label>
          <input
            className="form__input title-fieldset__text-input"
            placeholder="Title"
            name={FormFieldName.title}
            id="title"
            required
            defaultValue={title}
          />
        </div>
        <div className="title-fieldset__checkbox-wrapper">
          <input
            className="form__input"
            type="checkbox"
            name={FormFieldName.isPremium}
            id="isPremium"
            defaultChecked={isPremium}
          />
          <label htmlFor="isPremium" className="title-fieldset__checkbox-label">Premium</label>
        </div>
      </fieldset>
      <div className="form__input-wrapper">
        <label htmlFor="description" className="offer-form__label">Description</label>
        <textarea
          className="form__input offer-form__textarea"
          placeholder="Description"
          name={FormFieldName.description}
          id="description"
          required
          defaultValue={description}
        />
      </div>
      <div className="form__input-wrapper">
        <label htmlFor="previewImage" className="offer-form__label">Preview Image</label>
        <input
          className="form__input offer-form__text-input"
          type="url"
          placeholder="Preview image"
          name={FormFieldName.previewImage}
          id="previewImage"
          required
          defaultValue={previewImage}
        />
      </div>
      <fieldset className="images-fieldset">
        {images.map((image, index) => (
          <div key={`image-${index}`} className="form__input-wrapper">
            <label htmlFor={`image-${index}`} className="offer-form__label">
              Offer Image #{index + 1}
            </label>
            <input
              className="form__input offer-form__text-input"
              type="url"
              placeholder="Offer image"
              name={`${FormFieldName.image}-${index}`}
              id={`image-${index}`}
              required
              defaultValue={image}
            />
          </div>
        ))}
      </fieldset>
      <fieldset className="type-fieldset">
        <div className="form__input-wrapper">
          <label htmlFor="type" className="type-fieldset__label">Type</label>
          <Select
            className="type-fieldset__select"
            classNamePrefix="react-select"
            name={FormFieldName.type}
            id="type"
            defaultValue={{ value: type, label: capitalize(type) }}
            options={TYPES.map((typeItem) => ({
              value: typeItem,
              label: capitalize(typeItem),
            }))}
          />
        </div>
        <div className="form__input-wrapper">
          <label htmlFor="price" className="type-fieldset__label">Price</label>
          <input
            className="form__input type-fieldset__number-input"
            type="number"
            placeholder="100"
            name={FormFieldName.price}
            id="price"
            defaultValue={price}
          />
        </div>
        <div className="form__input-wrapper">
          <label htmlFor="bedrooms" className="type-fieldset__label">Bedrooms</label>
          <input
            className="form__input type-fieldset__number-input"
            type="number"
            placeholder="1"
            name={FormFieldName.bedrooms}
            id="bedrooms"
            required
            step={1}
            defaultValue={bedrooms}
          />
        </div>
        <div className="form__input-wrapper">
          <label htmlFor="maxAdults" className="type-fieldset__label">Max adults</label>
          <input
            className="form__input type-fieldset__number-input"
            type="number"
            placeholder="1"
            name={FormFieldName.maxAdults}
            id="maxAdults"
            required
            step={1}
            defaultValue={maxAdults}
          />
        </div>
      </fieldset>
      <fieldset className="goods-list">
        <h2 className="goods-list__title">Goods</h2>
        <ul className="goods-list__list">
          {GOODS.map((good) => (
            <li key={good} className="goods-list__item">
              <input
                type="checkbox"
                id={good}
                name={`${FormFieldName.good}${good}`}
                defaultChecked={chosenGoods.includes(good)}
              />
              <label className="goods-list__label" htmlFor={good}>{good}</label>
            </li>
          ))}
        </ul>
      </fieldset>
      <div className="form__input-wrapper location-picker">
        <label htmlFor="cityName" className="location-picker__label">Location</label>
        <Select
          className="location-picker__select"
          classNamePrefix="react-select"
          name={FormFieldName.cityName}
          id="cityName"
          defaultValue={{ value: chosenCity, label: chosenCity }}
          options={CITIES.map((cityItem) => ({
            value: cityItem,
            label: cityItem,
          }))}
          onChange={(evt) => {
            if (evt) {
              handleCityChange(evt.value);
            }
          }}
        />
      </div>
      <LocationPicker
        city={city}
        onChange={handleLocationChange}
        location={chosenLocation}
      />
      <button className="form__submit button" type="submit">Save</button>
    </form>
  );
};

export default OfferForm;
