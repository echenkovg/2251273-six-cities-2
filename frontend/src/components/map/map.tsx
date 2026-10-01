import { useRef, useEffect } from 'react';
import { Icon, Marker } from 'leaflet';

import type { City, Location } from '../../types/types';

import useMap from '../../hooks/useMap';
import {
  CityLocation,
  URL_MARKER_CURRENT,
  URL_MARKER_DEFAULT,
  ZOOM,
} from '../../const';

import 'leaflet/dist/leaflet.css';

type MapProps = {
  city: City;
  locations: (Location & { id?: string })[];
  activeOffer?: null | string;
  place?: 'cities' | 'property' | 'form';
};

const defaultCustomIcon = new Icon({
  iconUrl: URL_MARKER_DEFAULT,
  iconSize: [40, 40],
  iconAnchor: [20, 40],
});

const currentCustomIcon = new Icon({
  iconUrl: URL_MARKER_CURRENT,
  iconSize: [40, 40],
  iconAnchor: [20, 40],
});

const Map = ({
  city,
  locations,
  activeOffer,
  place = 'cities',
}: MapProps): JSX.Element => {
  const mapRef = useRef(null);
  const map = useMap(mapRef, city);
  const markersRef = useRef<Marker[]>([]);

  // Создаём маркеры при появлении карты и при смене списка офферов.
  useEffect(() => {
    if (!map) {
      return;
    }

    markersRef.current.forEach((marker) => map.removeLayer(marker));
    markersRef.current = [];

    locations.forEach(({ id, latitude: lat, longitude: lng }) => {
      const marker = new Marker({ lat, lng });
      marker.setIcon(defaultCustomIcon);
      marker.addTo(map);
      markersRef.current.push(marker);
    });
  }, [map, locations]);

  // Обновляем иконки при смене activeOffer.
  useEffect(() => {
    if (!map) {
      return;
    }

    markersRef.current.forEach((marker, index) => {
      const location = locations[index];
      if (!location) {
        return;
      }

      const isActive = activeOffer === location.id;
      marker.setIcon(isActive ? currentCustomIcon : defaultCustomIcon);
      marker.setZIndexOffset(isActive ? 1000 : 0);
    });
  }, [map, activeOffer, locations]);

  // Центрируем карту при смене города.
  useEffect(() => {
    if (!map) {
      return;
    }
    const { latitude: lat, longitude: lng } = CityLocation[city.name];
    map.setView({ lat, lng }, city.location.zoom ?? ZOOM);
  }, [map, city]);

  // Убираем маркеры при размонтировании.
  useEffect(
    () => () => {
      if (map) {
        markersRef.current.forEach((marker) => map.removeLayer(marker));
        markersRef.current = [];
      }
    },
    [map],
  );

  return <section className={`${place}__map map`} ref={mapRef} />;
};

export default Map;
