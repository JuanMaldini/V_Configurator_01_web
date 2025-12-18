import type { ReactNode } from "react";
import Sidebar from "react-sidebar";
import "./Sidebar.css";

const menuItems = ["Home", "Option 1", "Option 2", "Option 3", "Option 4", "Option 5"];

interface SidebarLayoutProps {
  children: ReactNode;
}

function SidebarLayout({ children }: SidebarLayoutProps) {
  return (
    <Sidebar
      sidebar={
        <nav className="sidebar-panel">
          <h2 className="sidebar-title">Menu</h2>
          <ul className="sidebar-list">
            {menuItems.map((item) => (
              <li key={item} className="sidebar-item">
                {item}
              </li>
            ))}
          </ul>
        </nav>
      }
      open
      docked
      pullRight
      touch={false}
      shadow={false}
      transitions={false}
      onSetOpen={() => {}}
      rootClassName="sidebar-root"
      sidebarClassName="sidebar-shell"
      contentClassName="sidebar-content"
      overlayClassName="sidebar-overlay"
    >
      <div className="sidebar-content">{children}</div>
    </Sidebar>
  );
}

export default SidebarLayout;
