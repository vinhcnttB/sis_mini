// role=1: admin
// role=2: user
// role=3: student
// role=4: teacher

export const getRoleFromId = (roleId) => {
  if (roleId === 1) {
    return "admin";
  } else if (roleId === 2) {
    return "user";
  } else if (roleId === 3) {
    return "student";
  } else if (roleId === 4) {
    return "teacher";
  }
};

export const getRoleIdFromRole = (role) => {
  if (role === "admin") {
    return 1;
  } else if (role === "user") {
    return 2;
  } else if (role === "student") {
    return 3;
  } else if (role === "teacher") {
    return 4;
  }
};
