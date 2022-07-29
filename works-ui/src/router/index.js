import { message } from "ant-design-vue";
import { createRouter, createWebHistory } from "vue-router";
import { worksApi } from "../api";
import AdminBaseLayout from "../components/layouts/AdminBaseLayout.vue";
import UserBaseLayout from "../components/layouts/UserBaseLayout.vue";
import Account from "../views/account/Account.vue";
import AccountDetail from "../views/account/AccountDetail.vue";
import Login from "../views/auth/Login.vue";
import Configuration from "../views/configuration/Configuration.vue";
import Dashboard from "../views/dashboard/Dashboard.vue";
import Exception404 from "../views/exception/404.vue";
import Favorite from "../views/favorite/Favorite.vue";
import GroupPolicy from "../views/groupPolicy/GroupPolicy.vue";
import GroupPolicyDetail from "../views/groupPolicy/GroupPolicyDetail.vue";
import UserDetail from "../views/user/UserDetail.vue";
import UserDesktop from "../views/userDesktop/UserDesktop.vue";
import VirtualMachine from "../views/virtualMachine/VirtualMachine.vue";
import VirtualMachineDetail from "../views/virtualMachine/VirtualMachineDetail.vue";
import Workspace from "../views/workSpace/WorkSpace.vue";
import WorkspaceDetail from "../views/workSpace/WorkSpaceDetail.vue";
import UserClient from "@/views/userClient/UserClient.vue";

// import Audit from "../views/audit/Audit.vue";
// import AuditDetail from "../views/audit/AuditDetail.vue";
// import Community from "../views/community/Community.vue";
// import CommunityDetail from "../views/community/CommunityDetail.vue";
// import axios from "axios";

let menukey = "";
const adminAuthCheck = (to, from, next) => {
  // console.log("adminAuthCheck:: " + to.name + ":" + from.name + ":" + next);
  if (to.name.includes("Dashboard")) {
    menukey = "1";
  }
  if (to.name.includes("Workspace")) {
    menukey = "2";
  }
  if (to.name.includes("VirtualMachine")) {
    menukey = "3";
  }
  if (to.name.includes("Account")) {
    menukey = "4";
  }
  if (to.name.includes("GroupPolicy")) {
    menukey = "5";
  }
  if (to.name.includes("Audit")) {
    menukey = "6";
  }
  if (to.name.includes("Community")) {
    menukey = "7";
  }
  if (to.name.includes("Configuration")) {
    menukey = "8";
  }
  sessionStorage.setItem("menukey", menukey);

  tokenCheck(to, from, next, true);
};

const userAuthCheck = (to, from, next) => {
  // console.log("userAuthCheck:: " + to.name + ":" + from.name + ":" + next);
  if (to.name.includes("Favorite")) {
    menukey = "1";
  }
  if (to.name.includes("UserDesktop")) {
    menukey = "2";
  }
  sessionStorage.setItem("menukey", menukey);

  tokenCheck(to, from, next, false);
};

const tokenCheck = (to, from, next, isAdmin) => {
  const isToken = sessionStorage.getItem("token");
  // console.log("isToken :>> ", isToken);
  if (isToken && isToken !== "") {
    if ((to.name === "UserFavorite" || to.name === "Dashboard") && from.name === "Login") {
      goRoute(0, next);
    } else {
      worksApi
        .get("/api/v1/token")
        .then((response) => {
          //console.log(response);
          if (response.status === 200) {
            if (
              /*response.data.result.isAdmin === isAdmin */
              (isAdmin && response.data.result.name.toLowerCase() === "administrator") ||
              (!isAdmin && response.data.result.name.toLowerCase() !== "administrator")
            ) {
              goRoute(0, next);
            } else {
              //goRoute(2, next);
            }
          } else {
            goRoute(1, next);
          }
        })
        .catch(function () {
          goRoute(1, next);
        });
    }
  } else {
    goRoute(1, next);
  }
};

const goRoute = (cd, next) => {
  switch (cd) {
    case 0:
      next();
      break;
    case 1:
      message.error("정상적인 로그인 인증값이 아닙니다. 다시 로그인해주세요.");
      sessionStorage.clear();
      next({ name: "Login" });
      break;
    // case 2:
    //   message.error("해당 URL을 이용하여 접근할 수 없습니다.");
    //   setTimeout(() => {
    //     router.go(-1);
    //   }, 1000);
    //   break;

    default:
      break;
  }
};

const routes = [
  {
    path: "/:catchAll(.*)",
    name: "Exception",
    hidden: true,
    component: Exception404,
    children: [
      // {
      //   path: '/exception/403',
      //   name: '403',
      //   hidden: true,
      //   component: () => import('@/views/exception/403'),
      //   meta: { title: '403' },
      // },
      // {
      //   path: "/404",
      //   name: "404",
      //   hidden: true,
      //   component: () => import("@/views/exception/404"),
      //   meta: { title: "404" },
      // },
      // {
      //   path: '/exception/500',
      //   name: '500',
      //   hidden: true,
      //   component: () => import(/* webpackChunkName: "fail" */ '@/views/exception/500'),
      //   meta: { title: '500' },
      // }
    ],
  }, // 정의된 routes값 외 path 요청이 올 경우 자동 로그인 페이지로 이동
  {
    path: "/",
    name: "Root",
    redirect: "/login",
    component: Login,
    children: [
      {
        path: "/login",
        name: "Login",
        component: Login,
      },
    ],
  },
  {
    path: "/admin",
    name: "Admin",
    component: AdminBaseLayout,
    redirect: "/dashboard",
    // beforeEnter: (to, from, failure) => {},
    children: [
      {
        path: "/dashboard",
        name: "Dashboard",
        component: Dashboard,
        beforeEnter: adminAuthCheck,
      },
      {
        path: "/workspace",
        name: "Workspace",
        component: Workspace,
        beforeEnter: adminAuthCheck,
      },
      {
        path: "/workspaceDetail/:workspaceUuid",
        name: "WorkspaceDetail",
        component: WorkspaceDetail,
        beforeEnter: adminAuthCheck,
        props: true,
      },
      {
        path: "/virtualMachine",
        name: "VirtualMachine",
        component: VirtualMachine,
        beforeEnter: adminAuthCheck,
      },
      {
        path: "/virtualMachineDetail/:vmUuid",
        name: "VirtualMachineDetail",
        component: VirtualMachineDetail,
        beforeEnter: adminAuthCheck,
        props: true,
      },
      {
        path: "/account",
        name: "Account",
        component: Account,
        beforeEnter: adminAuthCheck,
      },
      {
        path: "/accountDetail/:accountName",
        name: "AccountDetail",
        component: AccountDetail,
        beforeEnter: adminAuthCheck,
        props: true,
      },
      {
        path: "/groupPolicy",
        name: "GroupPolicy",
        component: GroupPolicy,
        beforeEnter: adminAuthCheck,
      },
      {
        path: "/groupPolicyDetail/:groupName",
        name: "GroupPolicyDetail",
        component: GroupPolicyDetail,
        beforeEnter: adminAuthCheck,
        props: true,
      },
      // {
      //   path: "/audit",
      //   name: "Audit",
      //   component: Audit,
      //   beforeEnter: adminAuthCheck,
      // },
      // {
      //   path: "/auditDetail",
      //   name: "AuditDetail",
      //   component: AuditDetail,
      //   beforeEnter: adminAuthCheck,
      //   props: true,
      // },
      // {
      //   path: "/community",
      //   name: "/Community",
      //   component: Community,
      //   beforeEnter: adminAuthCheck,
      // },
      // {
      //   path: "/community",
      //   name: "CommunityDetail",
      //   component: CommunityDetail,
      //   beforeEnter: adminAuthCheck,
      //   props: true,
      // },
      {
        path: "/configuration",
        name: "Configuration",
        component: Configuration,
        beforeEnter: adminAuthCheck,
      },
    ],
  },
  {
    path: "/clientdc/:crypto",
    name: "ClientDc",
    component: UserClient,
    beforeEnter: adminAuthCheck,
  },
  {
    path: "/user",
    name: "User",
    component: UserBaseLayout,
    meta: { icon: "home" },
    // redirect: "/favorite",
    redirect: "/userDesktop",
    children: [
      {
        path: "/favorite",
        name: "Favorite",
        component: Favorite,
        beforeEnter: userAuthCheck,
      },
      {
        path: "/userDesktop",
        name: "UserDesktop",
        component: UserDesktop,
        beforeEnter: userAuthCheck,
      },
      {
        path: "/userDetail",
        name: "UserDetail",
        component: UserDetail,
        beforeEnter: userAuthCheck,
      },
    ],
  },
  {
    path: "/client/:crypto",
    name: "Client",
    component: UserClient,
    beforeEnter: userAuthCheck,
  },
];

const index = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  mode: "history",
  routes,
});

export default index;
