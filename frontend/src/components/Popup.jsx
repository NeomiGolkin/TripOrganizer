import { useState } from 'react';
import './Popup.css';

function Popup({ title, data, onClose }) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredList = data.filter((item) => {
    const name = item.teacher_name || item.student_name || item.first_name || '';
    const id = item.id || '';

    const nameMatch = String(name).toLowerCase().includes(searchQuery.toLowerCase());
    const idMatch = String(id).toLowerCase().includes(searchQuery.toLowerCase());

    return nameMatch || idMatch;
  });

  return (
    <div className="modal">
      <div className="modal-content">

        <div className="modal-header">
          <h2>{title}</h2>
          <button onClick={onClose} className="close-btn">
            Close
          </button>
        </div>

        <input
          type="text"
          placeholder="Search by name or ID..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="search-input"
        />

        <div className="list-container">
          {filteredList.length === 0 ? (
            <p className="no-results">No results found.</p>
          ) : (
            filteredList.map((item, index) => {
              const firstName = item.teacher_name || item.student_name || item.first_name || 'Unknown';
              const lastName = item.last_name ? ` ${item.last_name}` : 'Unknown';
              const fullName = `${firstName}${lastName}`;
              const id =  item.id || 'Unknown';
              const className = item.class_name || 'Unknown';

              return (
                <div key={item.id} className="list-item">
                  <div className="item-info">
                    <span className="item-name">{fullName}</span>
                    <span className="item-class">Class: {className}</span>
                    {item.distance !== undefined && (
                      <span
                        className="item-distance"
                        style={{ color: '#d9534f', fontWeight: 'bold', fontSize: '0.9em', display: 'block', marginTop: '4px' }}
                      >
                       Distance: {item.distance}
                      </span>
                    )}
                  </div>
                  <span className="item-id">{id}</span>
                </div>
              );
            })
          )}
        </div>

      </div>
    </div>
  );
}

export default Popup;