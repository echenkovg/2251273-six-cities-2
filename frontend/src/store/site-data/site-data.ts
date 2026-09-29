import { createSlice } from '@reduxjs/toolkit';

import type { SiteData } from '../../types/state';
import { StoreSlice, SubmitStatus } from '../../const';
import {
  fetchOffers, fetchOffer, fetchPremiumOffers, fetchComments,
  postComment, postFavorite, deleteFavorite, fetchFavoriteOffers,
  postOffer, editOffer, deleteOffer,
  logoutUser,
} from '../action';

const initialState: SiteData = {
  offers: [],
  isOffersLoading: false,
  offer: null,
  isOfferLoading: false,
  favoriteOffers: [],
  isFavoriteOffersLoading: false,
  premiumOffers: [],
  comments: [],
  commentStatus: SubmitStatus.Still,
};

export const siteData = createSlice({
  name: StoreSlice.SiteData,
  initialState,
  reducers: {},
  extraReducers(builder) {
    builder
      // ─── Offers ───────────────────────────────────────────────────────
      .addCase(fetchOffers.pending, (state) => {
        state.isOffersLoading = true;
      })
      .addCase(fetchOffers.fulfilled, (state, action) => {
        const favoriteIds = new Set(state.favoriteOffers.map((o) => o.id));
        state.offers = action.payload.map((offer) => ({
          ...offer,
          isFavorite: favoriteIds.has(offer.id),
        }));
        state.isOffersLoading = false;
      })
      .addCase(fetchOffers.rejected, (state) => {
        state.isOffersLoading = false;
      })

      // ─── Favorite offers ──────────────────────────────────────────────
      .addCase(fetchFavoriteOffers.pending, (state) => {
        state.isFavoriteOffersLoading = true;
      })
      .addCase(fetchFavoriteOffers.fulfilled, (state, action) => {
        state.favoriteOffers = action.payload;
        state.isFavoriteOffersLoading = false;

        const favoriteIds = new Set(action.payload.map((o) => o.id));
        state.offers = state.offers.map((offer) => ({
          ...offer,
          isFavorite: favoriteIds.has(offer.id),
        }));
        state.premiumOffers = state.premiumOffers.map((offer) => ({
          ...offer,
          isFavorite: favoriteIds.has(offer.id),
        }));
        if (state.offer) {
          state.offer = {
            ...state.offer,
            isFavorite: favoriteIds.has(state.offer.id),
          };
        }
      })
      .addCase(fetchFavoriteOffers.rejected, (state) => {
        state.isFavoriteOffersLoading = false;
      })

      // ─── Single offer ─────────────────────────────────────────────────
      .addCase(fetchOffer.pending, (state) => {
        state.isOfferLoading = true;
      })
      .addCase(fetchOffer.fulfilled, (state, action) => {
        const favoriteIds = new Set(state.favoriteOffers.map((o) => o.id));
        state.offer = {
          ...action.payload,
          isFavorite: favoriteIds.has(action.payload.id),
        };
        state.isOfferLoading = false;
      })
      .addCase(fetchOffer.rejected, (state) => {
        state.isOfferLoading = false;
      })

      // ─── CRUD офферов ─────────────────────────────────────────────────
      .addCase(postOffer.fulfilled, (state, action) => {
        state.offers.push(action.payload);
      })
      .addCase(editOffer.fulfilled, (state, action) => {
        const updatedOffer = action.payload;
        state.offers = state.offers.map((offer) =>
          offer.id === updatedOffer.id ? updatedOffer : offer,
        );
        state.favoriteOffers = state.favoriteOffers.map((offer) =>
          offer.id === updatedOffer.id ? updatedOffer : offer,
        );
        state.premiumOffers = state.premiumOffers.map((offer) =>
          offer.id === updatedOffer.id ? updatedOffer : offer,
        );
        if (state.offer && state.offer.id === updatedOffer.id) {
          state.offer = updatedOffer;
        }
      })
      .addCase(deleteOffer.fulfilled, (state, action) => {
        const id = action.meta.arg;
        state.offers = state.offers.filter((offer) => offer.id !== id);
        state.favoriteOffers = state.favoriteOffers.filter((offer) => offer.id !== id);
        state.premiumOffers = state.premiumOffers.filter((offer) => offer.id !== id);
        if (state.offer && state.offer.id === id) {
          state.offer = null;
        }
      })

      // ─── Premium / Comments ───────────────────────────────────────────
      .addCase(fetchPremiumOffers.fulfilled, (state, action) => {
        const favoriteIds = new Set(state.favoriteOffers.map((o) => o.id));
        state.premiumOffers = action.payload.map((offer) => ({
          ...offer,
          isFavorite: favoriteIds.has(offer.id),
        }));
      })
      .addCase(fetchComments.fulfilled, (state, action) => {
        state.comments = action.payload;
      })
      .addCase(postComment.pending, (state) => {
        state.commentStatus = SubmitStatus.Pending;
      })
      .addCase(postComment.fulfilled, (state, action) => {
        state.comments.push(action.payload);
        state.commentStatus = SubmitStatus.Fullfilled;
      })
      .addCase(postComment.rejected, (state) => {
        state.commentStatus = SubmitStatus.Rejected;
      })

      // ─── Favorite toggle ──────────────────────────────────────────────
      .addCase(postFavorite.fulfilled, (state, action) => {
        const updatedOffer = action.payload;
        state.offers = state.offers.map((offer) =>
          offer.id === updatedOffer.id ? updatedOffer : offer,
        );
        state.premiumOffers = state.premiumOffers.map((offer) =>
          offer.id === updatedOffer.id ? updatedOffer : offer,
        );
        state.favoriteOffers = state.favoriteOffers.concat(updatedOffer);

        if (state.offer && state.offer.id === updatedOffer.id) {
          state.offer = updatedOffer;
        }
      })
      .addCase(deleteFavorite.fulfilled, (state, action) => {
        const updatedOffer = action.payload;
        state.offers = state.offers.map((offer) =>
          offer.id === updatedOffer.id ? updatedOffer : offer,
        );
        state.premiumOffers = state.premiumOffers.map((offer) =>
          offer.id === updatedOffer.id ? updatedOffer : offer,
        );
        state.favoriteOffers = state.favoriteOffers.filter(
          (favoriteOffer) => favoriteOffer.id !== updatedOffer.id,
        );

        if (state.offer && state.offer.id === updatedOffer.id) {
          state.offer = updatedOffer;
        }
      })

      // ─── Logout ───────────────────────────────────────────────────────
      .addCase(logoutUser.fulfilled, (state) => {
        state.favoriteOffers = [];
        state.offers = state.offers.map((offer) => ({
          ...offer,
          isFavorite: false,
        }));
        state.premiumOffers = state.premiumOffers.map((offer) => ({
          ...offer,
          isFavorite: false,
        }));
        if (state.offer) {
          state.offer = { ...state.offer, isFavorite: false };
        }
      })
      .addCase(logoutUser.rejected, (state) => {
        state.favoriteOffers = [];
        state.offers = state.offers.map((offer) => ({
          ...offer,
          isFavorite: false,
        }));
        state.premiumOffers = state.premiumOffers.map((offer) => ({
          ...offer,
          isFavorite: false,
        }));
        if (state.offer) {
          state.offer = { ...state.offer, isFavorite: false };
        }
      });
  },
});
