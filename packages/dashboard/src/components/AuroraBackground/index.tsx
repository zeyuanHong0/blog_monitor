import React from "react";
import styles from "./index.module.scss";

interface AuroraBackgroundProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
}

export const AuroraBackground: React.FC<AuroraBackgroundProps> = ({
  children,
  className = "",
  ...props
}) => {
  return (
    <div className={`${styles.auroraContainer} ${className}`} {...props}>
      <div className={styles.aurora_root} aria-hidden="true">
        <div className={styles.aurora_glow}></div>
      </div>
      <div className={styles.content}>
        {children}
      </div>
    </div>
  );
};
