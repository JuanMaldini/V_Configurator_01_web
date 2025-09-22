import "./App.css";

function ConfiguratorPlayer() {
  return (
    <div className="rooot">
    <iframe
      style={{ visibility: 'visible', border: 'none' }}
      id='iframe_1'
      src='https://connector.eagle3dstreaming.com/v6/eyJvd25lciI6IlZhbmlzaGluZ1BvaW50M0QiLCJhcHBOYW1lIjoiVkNvbmZpZ3VyYXRvciIsImNvbmZpZ05hbWUiOiJWQ29uZmlndXJhdG9yIn0='
      height='100%'
      allowfullscreen
      title='host'
    ></iframe>
    </div>
  );
}

export default ConfiguratorPlayer;