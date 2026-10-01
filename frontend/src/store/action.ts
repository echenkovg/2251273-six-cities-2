import type { History } from 'history';
import type { AxiosInstance, AxiosError } from 'axios';
import { createAsyncThunk } from '@reduxjs/toolkit';
import type {
  UserAuth, User, Offer, Comment, NewComment, NewOffer, UserRegister,
} from '../types/types';
import { ApiRoute, AppRoute, HttpCode } from '../const';
import { Token } from '../utils';

type Extra = {
  api: AxiosInstance;
  history: History;
};

export const Action = {
  FETCH_OFFERS: 'offers/fetch',
  FETCH_OFFER: 'offer/fetch',
  POST_OFFER: 'offer/post-offer',
  EDIT_OFFER: 'offer/edit-offer',
  DELETE_OFFER: 'offer/delete-offer',
  FETCH_FAVORITE_OFFERS: 'offers/fetch-favorite',
  FETCH_PREMIUM_OFFERS: 'offers/fetch-premium',
  FETCH_COMMENTS: 'offer/fetch-comments',
  POST_COMMENT: 'offer/post-comment',
  POST_FAVORITE: 'offer/post-favorite',
  DELETE_FAVORITE: 'offer/delete-favorite',
  LOGIN_USER: 'user/login',
  LOGOUT_USER: 'user/logout',
  FETCH_USER_STATUS: 'user/fetch-status',
  REGISTER_USER: 'user/register',
};

const toOfferPayload = (offer: NewOffer | Offer) => ({
  title: offer.title,
  type: offer.type,
  price: offer.price,
  previewImage: offer.previewImage,
  cityName: offer.cityName,
  cityLatitude: offer.cityLatitude,
  cityLongitude: offer.cityLongitude,
  cityZoom: offer.cityZoom ?? 12,
  offerLatitude: offer.offerLatitude,
  offerLongitude: offer.offerLongitude,
  offerZoom: offer.offerZoom ?? 16,
  isPremium: offer.isPremium ?? false,
  description: offer.description,
  bedrooms: offer.bedrooms,
  offerGoods: offer.offerGoods,
  images: offer.images,
  maxAdults: offer.maxAdults,
});

// ─── Offers ─────────────────────────────────────────────────────────────────

export const fetchOffers = createAsyncThunk<Offer[], undefined, { extra: Extra }>(
  Action.FETCH_OFFERS,
  async (_, { extra }) => {
    const { api } = extra;
    const { data } = await api.get<Offer[]>(ApiRoute.Offers);
    return data;
  },
);

export const fetchFavoriteOffers = createAsyncThunk<Offer[], undefined, { extra: Extra }>(
  Action.FETCH_FAVORITE_OFFERS,
  async (_, { extra }) => {
    const { api } = extra;
    const { data } = await api.get<Offer[]>(ApiRoute.Favorite);
    return data;
  },
);

export const fetchOffer = createAsyncThunk<Offer, Offer['id'], { extra: Extra }>(
  Action.FETCH_OFFER,
  async (id, { extra }) => {
    const { api, history } = extra;
    try {
      const { data } = await api.get<Offer>(`${ApiRoute.Offers}/${id}`);
      return data;
    } catch (error) {
      const axiosError = error as AxiosError;
      if (axiosError.response?.status === HttpCode.NotFound) {
        history.push(AppRoute.NotFound);
      }
      return Promise.reject(error);
    }
  },
);

export const postOffer = createAsyncThunk<Offer, NewOffer, { extra: Extra }>(
  Action.POST_OFFER,
  async (newOffer, { extra }) => {
    const { api, history } = extra;
    const { data } = await api.post<Offer>(ApiRoute.Offers, toOfferPayload(newOffer));
    history.push(`${AppRoute.Property}/${data.id}`);
    return data;
  },
);

export const editOffer = createAsyncThunk<Offer, Offer, { extra: Extra }>(
  Action.EDIT_OFFER,
  async (offer, { extra }) => {
    const { api, history } = extra;
    const { data } = await api.patch<Offer>(
      `${ApiRoute.Offers}/${offer.id}`,
      toOfferPayload(offer),
    );
    history.push(`${AppRoute.Property}/${data.id}`);
    return data;
  },
);

export const deleteOffer = createAsyncThunk<void, string, { extra: Extra }>(
  Action.DELETE_OFFER,
  async (id, { extra }) => {
    const { api, history } = extra;
    await api.delete(`${ApiRoute.Offers}/${id}`);
    history.push(AppRoute.Root);
  },
);

export const fetchPremiumOffers = createAsyncThunk<Offer[], string, { extra: Extra }>(
  Action.FETCH_PREMIUM_OFFERS,
  async (cityName, { extra }) => {
    const { api } = extra;
    const { data } = await api.get<Offer[]>(`${ApiRoute.Premium}/${cityName}`);
    return data;
  },
);

// ─── Comments ───────────────────────────────────────────────────────────────

export const fetchComments = createAsyncThunk<Comment[], Offer['id'], { extra: Extra }>(
  Action.FETCH_COMMENTS,
  async (id, { extra }) => {
    const { api } = extra;
    const { data } = await api.get<Comment[]>(`${ApiRoute.Offers}/${id}${ApiRoute.Comments}`);
    return data;
  },
);

export const postComment = createAsyncThunk<
  Comment,
  { id: string } & NewComment,
  { extra: Extra }
>(
  Action.POST_COMMENT,
  async ({ id, text, rating }, { extra }) => {
    const { api } = extra;
    const { data } = await api.post<Comment>(
      `${ApiRoute.Offers}/${id}${ApiRoute.Comments}`,
      { text, rating },
    );
    return data;
  },
);

// ─── Auth ───────────────────────────────────────────────────────────────────

export const fetchUserStatus = createAsyncThunk<User, undefined, { extra: Extra }>(
  Action.FETCH_USER_STATUS,
  async (_, { extra }) => {
    const { api } = extra;

    if (!Token.get()) {
      return Promise.reject(new Error('No auth token'));
    }

    try {
      const { data } = await api.get<User>(ApiRoute.Check);
      return data;
    } catch (error) {
      const axiosError = error as AxiosError;
      if (axiosError.response?.status === HttpCode.NoAuth) {
        Token.drop();
      }
      return Promise.reject(error);
    }
  },
);

export const loginUser = createAsyncThunk<User, UserAuth, { extra: Extra }>(
  Action.LOGIN_USER,
  async ({ email, password }, { extra }) => {
    const { api, history } = extra;
    const { data } = await api.post<{ token: string; user: User }>(
      ApiRoute.Login,
      { email, password },
    );
    Token.save(data.token);
    history.push(AppRoute.Root);
    return data.user;
  },
);

export const logoutUser = createAsyncThunk<void, undefined, { extra: Extra }>(
  Action.LOGOUT_USER,
  async (_, { extra }) => {
    const { api } = extra;
    await api.post(ApiRoute.Logout);
    Token.drop();
  },
);

export const registerUser = createAsyncThunk<void, UserRegister, { extra: Extra }>(
  Action.REGISTER_USER,
  async ({ email, password, name, avatar }, { extra }) => {
    const { api, history } = extra;

    await api.post<User>(ApiRoute.Users, { name, email, password });

    const { data: loginData } = await api.post<{ token: string; user: User }>(
      ApiRoute.Login,
      { email, password },
    );
    Token.save(loginData.token);

    if (avatar) {
      const payload = new FormData();
      payload.append('avatar', avatar);
      await api.post(ApiRoute.Avatar, payload, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    }

    history.push(AppRoute.Root);
  },
);

// ─── Favorite ───────────────────────────────────────────────────────────────

export const postFavorite = createAsyncThunk<Offer, Offer['id'], { extra: Extra }>(
  Action.POST_FAVORITE,
  async (id, { extra }) => {
    const { api, history } = extra;
    try {
      const { data } = await api.post<Offer>(`${ApiRoute.Offers}/${id}/favorite`);
      return data;
    } catch (error) {
      const axiosError = error as AxiosError;
      if (axiosError.response?.status === HttpCode.NoAuth) {
        history.push(AppRoute.Login);
      }
      return Promise.reject(error);
    }
  },
);

export const deleteFavorite = createAsyncThunk<Offer, Offer['id'], { extra: Extra }>(
  Action.DELETE_FAVORITE,
  async (id, { extra }) => {
    const { api, history } = extra;
    try {
      await api.delete(`${ApiRoute.Offers}/${id}/favorite`);
      const { data } = await api.get<Offer>(`${ApiRoute.Offers}/${id}`);
      return data;
    } catch (error) {
      const axiosError = error as AxiosError;
      if (axiosError.response?.status === HttpCode.NoAuth) {
        history.push(AppRoute.Login);
      }
      return Promise.reject(error);
    }
  },
);
