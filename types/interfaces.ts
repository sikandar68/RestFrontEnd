export interface User {
  name?: string | null | undefined;
  id?: string;
  saId?: string;
  role?: string;
  userEmail?: string;
  userName?: string;
  accessToken?: string;
  permissions?: string;
}

export interface MenuItems {
  itemId: number;
  name: string;
  localizedName: string;
  href: string;
  permission?: string;
  parentId?: number;
  subItems?: MenuItems[];
  icon : string;
}
