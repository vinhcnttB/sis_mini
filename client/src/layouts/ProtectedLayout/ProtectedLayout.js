import { Navigate, useOutlet } from "react-router-dom";

import Page from "../../components/Page";

const ProtectedLayout = ({ isAllowed, redirectPath, children }) => {
  const outlet = useOutlet();

  if (!isAllowed) {
    return <Navigate to={redirectPath} replace />;
  }

  return children ? <Page>{children}</Page> : <Page>{outlet}</Page>;
};

export default ProtectedLayout;
