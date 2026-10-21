declare namespace App {
  interface Locals {
    user: import("./cms/auth").CmsUser | null;
  }
}
