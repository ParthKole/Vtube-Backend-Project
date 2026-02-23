import { Link } from 'react-router-dom';
import styles from './VideoCard.module.css';

export function VideoCard({ video, showEdit = false, onEdit }) {
  const v = video?.data ?? video;
  const owner = v?.owner;
  const thumb = v?.thumbnail?.url ?? v?.thumbnail;

  const handleEditClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onEdit?.(v);
  };

  return (
    <div className={styles.wrapper}>
      <Link to={`/watch/${v?._id}`} className={styles.card}>
        <div className={styles.thumb}>
          <img src={thumb} alt={v?.title} />
          <span className={styles.duration}>{formatDuration(v?.duration)}</span>
        </div>
        <div className={styles.info}>
          {owner?.avatar ? (
            <img src={owner.avatar} alt="" className={styles.avatar} />
          ) : (
            <div className={styles.avatarPlaceholder} aria-hidden="true" />
          )}
          <div>
            <h3 className={styles.title}>{v?.title}</h3>
            <p className={styles.channel}>{owner?.username ?? owner?.fullName ?? 'Unknown'}</p>
            <p className={styles.meta}>{v?.views ?? 0} views</p>
          </div>
        </div>
      </Link>
      {showEdit && onEdit && (
        <button
          type="button"
          className={styles.editBtn}
          onClick={handleEditClick}
          aria-label="Edit video"
        >
          Edit
        </button>
      )}
    </div>
  );
}

function formatDuration(sec) {
  if (!sec) return '0:00';
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}
