import { NewOffer } from '../../types/types';
import { CITIES, CityLocation, DEFAULT_CITY_ZOOM, DEFAULT_OFFER_ZOOM } from '../../const';
import OfferForm from '../../components/offer-form/offer-form';
import { useAppDispatch } from '../../hooks';
import { postOffer } from '../../store/action';

const emptyOffer: NewOffer = {
  title: '',
  description: '',
  cityName: CITIES[0],
  cityLatitude: CityLocation[CITIES[0]].latitude,
  cityLongitude: CityLocation[CITIES[0]].longitude,
  cityZoom: DEFAULT_CITY_ZOOM,
  offerLatitude: CityLocation[CITIES[0]].latitude,
  offerLongitude: CityLocation[CITIES[0]].longitude,
  offerZoom: DEFAULT_OFFER_ZOOM,
  previewImage: '',
  isPremium: false,
  type: 'apartment',
  bedrooms: 1,
  maxAdults: 1,
  price: 100,
  offerGoods: [],
  images: new Array(6).fill(''),
};

const AddOffer = (): JSX.Element | null => {
  const dispatch = useAppDispatch();

  const handleFormSubmit = (offerData: NewOffer) => {
    dispatch(postOffer(offerData));
  };

  return (
    <main className="page__main">
      <div className="container">
        <section>
          <h1>Add new offer</h1>
          <OfferForm offer={emptyOffer} onSubmit={handleFormSubmit} />
        </section>
      </div>
    </main>
  );
};

export default AddOffer;
