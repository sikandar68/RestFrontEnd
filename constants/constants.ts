import { SideNavItem } from "@/types/types";
import {
  ArticleIcon,
  CollapsIcon,
  HomeIcon,
  LogoIcon,
  LogoutIcon,
  UsersIcon,
  VideosIcon,
} from "../components/icons";
export const LangDropDown = [
  {
    id: 1,
    value: 'en',
    label: 'English',
  },
  {
    id: 2,
    value: 'ar',
    label: 'عربی',
  },
];

export const themes = [
  { value: 'default', label: 'default' },
  { value: 'dark', label: 'dark' },
];
export const USER_IMAGE_URL =
  "https://localhost:7160/Image/mine234629318.jpg";
  
  export const SIDENAV_ITEMS: SideNavItem[] = [
    {
      id : 1,
      title: 'Home',
      path: '/',
      icon: HomeIcon, //<Icon icon="lucide:home" width="24" height="24" />,
    },
    {
      id : 2,
      title: 'Projects',
      path: '/projects',
      icon: UsersIcon, //<Icon icon="lucide:folder" width="24" height="24" />,
      submenu: true,
      subMenuItems: [
        {id: 3, title: 'All', path: '/projects' },
        {id: 4, title: 'Web Design', path: '/projects/web-design' },
        {id: 5, title: 'Graphic Design', path: '/projects/graphic-design' },
      ],
    },
    {
      id: 6,
      title: 'Messages',
      path: '/messages',
      icon: VideosIcon, //<Icon icon="lucide:mail" width="24" height="24" />,
    },
    {
      id: 7,
      title: 'Settings',
      path: '/settings',
      icon: HomeIcon, //<Icon icon="lucide:settings" width="24" height="24" />,
      submenu: true,
      subMenuItems: [
        {id :8, title: 'Account', path: '/settings/account' },
        {id :9, title: 'Privacy', path: '/settings/privacy' },
      ],
    },
    {
      id:10,
      title: 'Help',
      path: '/help',
      icon: HomeIcon //<Icon icon="lucide:help-circle" width="24" height="24" />,
    },
  ];
  
