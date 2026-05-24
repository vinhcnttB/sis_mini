import React from "react";
import cn from "classnames";
import styles from "./LargeInput.module.sass";
import Icon from "../Icon";
import Tooltip from "../Tooltip";

const LargeInput = ({
  className,
  classLabel,
  classInput,
  label,
  icon,
  copy,
  currency,
  tooltip,
  place,
  innerRef,
  ...props
}) => {
  return (
    <div
      className={cn(
        styles.field,
        { [styles.fieldIcon]: icon },
        { [styles.fieldCopy]: copy },
        { [styles.fieldCurrency]: currency },
        className
      )}
    >
      {label && (
        <div className={cn(classLabel, styles.label)}>
          {label}{" "}
          {tooltip && (
            <Tooltip
              className={styles.tooltip}
              title={tooltip}
              icon="info"
              place={place ? place : "right"}
            />
          )}
        </div>
      )}
      <div className={styles.wrap}>
        <textarea
          className={cn(classInput, styles.input)}
          {...props}
          ref={innerRef}
        />
        {icon && (
          <div className={styles.icon}>
            <Icon name={icon} size="24" />{" "}
          </div>
        )}
        {copy && (
          <button className={styles.copy}>
            <Icon name="copy" size="24" />{" "}
          </button>
        )}
        {currency && <div className={styles.currency}>{currency}</div>}
      </div>
    </div>
  );
};

export default LargeInput;
