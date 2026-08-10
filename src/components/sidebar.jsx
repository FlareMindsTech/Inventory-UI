import { NavLink } from "react-router-dom";
import logo from "../assets/aadvi logo resized.png";

export default function Sidebar({ items }) {
  return (
    <div className="w-[200px] bg-white border-r border-brand-100 min-h-screen px-4 py-6 flex-shrink-0">
      <div className="flex items-center gap-2 mb-8 px-2">
        <div className="w-10 h-10 flex items-center justify-center">
  <img
    src={logo}
    alt="Company Logo"
    className="w-full h-full object-contain"
  />

          <i className="ti ti-hanger text-white text-sm" />
        </div>
        <span className="text-brand-900 text-sm font-medium">Aadvi</span>
      </div>

      <div className="flex flex-col gap-1">
        {items.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors ${
                isActive
                  ? "bg-brand-200 text-brand-600 font-medium"
                  : "text-brand-400 hover:bg-brand-50"
              }`
            }
          >
            <i className={`ti ${item.icon} text-base`} />
            {item.label}
          </NavLink>
        ))}
      </div>
    </div>
  );
}