import './Header.css';

function Header(props) {
  return (
    <header className="header-container">
      <div className="header">

        <div className="user-actions">
          <button onClick={props.onLogout} className="logout-btn">
            Logout
          </button>
          <div className="user">
            Teacher | {props.teacherName}
          </div>
        </div>

        <div className="header-logo">
          Bnot Moshe - Annual Trip
        </div>

      </div>
    </header>
  );
}

export default Header;