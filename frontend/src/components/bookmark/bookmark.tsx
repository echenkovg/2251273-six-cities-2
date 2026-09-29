import { MouseEvent } from 'react';

import { useAppDispatch, useAppSelector } from '../../hooks';
import { postFavorite, deleteFavorite } from '../../store/action';
import { getIsAuthorized } from '../../store/user-process/selectors';
import { AppRoute } from '../../const';
import { useNavigate } from 'react-router-dom';

type BookmarkProps = {
  id: string;
  isActive: boolean;
  place: 'place-card' | 'property';
};

const Bookmark = ({ id, isActive, place }: BookmarkProps) => {
  const dispatch = useAppDispatch();
  const isAuthorized = useAppSelector(getIsAuthorized);
  const navigate = useNavigate();

  const handleClick = (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();

    if (!isAuthorized) {
      navigate(AppRoute.Login);
      return;
    }

    if (isActive) {
      dispatch(deleteFavorite(id));
    } else {
      dispatch(postFavorite(id));
    }
  };

  return (
    <button
      className={`${place}__bookmark-button button${isActive ? ` ${place}__bookmark-button--active` : ''}`}
      type="button"
      onClick={handleClick}
    >
      <svg
        className={`${place}__bookmark-icon`}
        width={place === 'property' ? 31 : 18}
        height={place === 'property' ? 33 : 19}
      >
        <use xlinkHref="#icon-bookmark" />
      </svg>
      <span className="visually-hidden">{isActive ? 'From bookmarks' : 'To bookmarks'}</span>
    </button>
  );
};

export default Bookmark;
