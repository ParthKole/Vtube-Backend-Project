import { Link } from 'react-router-dom';

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
    <div className="vcard-edit-wrap">
      <Link to={`/watch/${v?._id}`} className="vcard">
        <div className="vcard-thumb">
          {thumb ? (
            <img src={thumb} alt={v?.title} />
          ) : (
            <div className="vcard-thumb-placeholder">🎬</div>
          )}
          <span className="vcard-duration">{formatDuration(v?.duration)}</span>
          <div className="vcard-play-overlay">
            <div className="play-btn-big">▶</div>
          </div>
        </div>
        <div className="vcard-info">
          <div className="vcard-meta-row">
            {owner?.avatar ? (
              <img src={owner.avatar} alt="" className="vcard-avatar" />
            ) : (
              <div className="vcard-avatar" aria-hidden="true">
                {(owner?.username?.[0] ?? owner?.fullName?.[0] ?? '?').toUpperCase()}
              </div>
            )}
            <div className="vcard-title-text">{v?.title}</div>
          </div>
          <div className="vcard-sub">
            <span>{owner?.username ?? owner?.fullName ?? 'Unknown'}</span>
            <span>·</span>
            <span>{v?.views ?? 0} views</span>
          </div>
        </div>
      </Link>
      {showEdit && onEdit && (
        <button
          type="button"
          className="vcard-edit-btn"
          onClick={handleEditClick}
          aria-label="Edit video"
        >
          ✏️
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
