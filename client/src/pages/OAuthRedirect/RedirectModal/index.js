import React, { useEffect } from "react";
import { createPortal } from "react-dom";
import { disableBodyScroll, clearAllBodyScrollLocks } from "body-scroll-lock";
import OutsideClickHandler from "react-outside-click-handler";
import cn from "classnames";
import styles from "./RedirectModal.module.sass";

const RedirectModal = ({ outerClassName, visible, onClose, children }) => {
  useEffect(() => {
    if (visible) {
      const target = document.querySelector("#modal");
      disableBodyScroll(target);
    } else {
      clearAllBodyScrollLocks();
    }
  }, [visible]);

  return createPortal(
    visible && (
      <div id="modal" className={styles.modal}>
        <div className={cn(styles.outer, outerClassName)}>
          <OutsideClickHandler onOutsideClick={onClose}>
            {children}
          </OutsideClickHandler>
        </div>
      </div>
    ),
    document.body
  );
};

export default RedirectModal;
