import { Routes, Route, Navigate } from "react-router-dom";
import SignUp from "./pages/SignUp/SignUp";
import SignIn from "./pages/SignIn/SignIn";
import ForgotPassword from "./pages/ForgotPassword/ForgotPassword";
import ProtectedLayout from "./layouts/ProtectedLayout/ProtectedLayout";
import ResetPassword from "./pages/ResetPassword/ResetPassword";
import Profile from "./pages/Profile/Profile";
import Settings from "./pages/Settings/Settings";
import NotFound from "./pages/NotFound/NotFound";
import LandingPage from "./pages/Landing Page/LandingPage";
import Home from "./pages/Home/Home";
import ClassesDashboard from "./pages/ClassesDashboard/ClassesDashboard";
import ClassInfo from "./pages/ClassInfo/ClassInfo";
import Stats from "./pages/ManageClass/ManageClass";
import "./styles/app.sass";
import AuthLayout from "./layouts/Auth/AuthLayout";
import OAuthRedirect from "./pages/OAuthRedirect/OAuthRedirect";
import CreateClass from "./pages/CreateClass/CreateClass";
import Classes from "./pages/ClassesDashboard/Classes";
import ClassesAdmin from "./pages/ManageClass/ClassesAdmin";
import { useAuth } from "./hooks/useAuth";
import GroupInvite from "./pages/GroupInvite/GroupInvite";
import EmailInvite from "./pages/EmailInvite/EmailInvite";
import AssignmentTeacher from "./pages/AssignmentTeacher/AssignmentTeacher";
import AssignmentStudent from "./pages/AssignmentStudent/AssignmentStudent";
import Notifications from "./pages/Notifications";
import ManageClass from "./pages/ManageClass/ManageClass";
function App() {
    const { user } = useAuth();
    return (
        <div className="App">
            <Routes>
                {/** All user can access to these routes */}
                <Route path="/" element={<LandingPage />} />
                <Route path="/auth" element={<AuthLayout />}>
                    <Route path="" element={<Navigate to="sign-in" />} />
                    <Route path="sign-up" element={<SignUp />} />
                    <Route path="sign-in" index element={<SignIn />} />
                    <Route path="reset-password" element={<ResetPassword />} />
                    <Route
                        path="forgot-password"
                        element={<ForgotPassword />}
                    />
                    <Route path="oauth-redirect" element={<OAuthRedirect />} />
                </Route>
                <Route path="*" element={<NotFound />} />
                {/** All user logged in can access to these routes */}
                <Route
                    element={
                        <ProtectedLayout
                            isAllowed={!!user}
                            redirectPath="/auth/sign-in"
                        />
                    }
                >
                    <Route path="settings" element={<Settings />} />
                    <Route path="notifications" element={<Notifications />} />
                    <Route path="classes" element={<ClassesDashboard />}>
                        <Route index element={<Classes />} />
                        <Route exact path=":classId" element={<ClassInfo />} />
                        <Route
                            path=":classId/assignment/:assignmentId/teacher"
                            element={<AssignmentTeacher />}
                        />
                        <Route
                            path=":classId/assignment/:assignmentId/student"
                            element={<AssignmentStudent />}
                        />
                    </Route>

                    <Route path="profile" element={<Profile />} />
                    <Route path="group-invite" element={<GroupInvite />} />
                    <Route path="invite" element={<EmailInvite />} />
                </Route>
                {/**Only teacher can access to these routes */}
                <Route
                    element={
                        <ProtectedLayout
                            isAllowed={!!user && user.role === "teacher"}
                            redirectPath="/classes"
                        />
                    }
                >
                    <Route path="classes/addClass" element={<CreateClass />} />
                </Route>
                {/**Only admin can access to these routes */}
                <Route
                    element={
                        <ProtectedLayout
                            isAllowed={!!user && user.role === "admin"}
                            redirectPath="/classes"
                        />
                    }
                >
                    <Route path="manage/users" index element={<Home />} />
                    <Route path="manage/classes" element={<ManageClass />}>
                        <Route index element={<ClassesAdmin />} />
                    </Route>
                </Route>
            </Routes>
        </div>
    );
}

export default App;
