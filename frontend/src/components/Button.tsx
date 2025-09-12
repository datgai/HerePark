import styles from "./Button.module.css";

type NavbuttonProps = {
  isActive?: boolean;
  isDisabled?: boolean;
  children: React.ReactNode;
};

Navbutton.defaultProps = {
  isActive: false,
  isDisabled: false,
};

function Navbutton({ isActive, children }: NavbuttonProps) {
  return <button className={isActive ? styles.active : ""}>{children}</button>;
}

export default Navbutton;
