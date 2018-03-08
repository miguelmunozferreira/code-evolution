import { Component, OnInit } from '@angular/core';

import { UserService } from '../../services/user.service';
import { GlobalService } from '../../services/global.service';

@Component({
  selector: 'app-navigation-menu',
  templateUrl: './navigation-menu.component.html',
  styleUrls: ['./navigation-menu.component.css'],
  providers: [UserService, GlobalService]
})
export class NavigationMenuComponent implements OnInit {

  public identity;
  public url: String;

  constructor(
    private _userService: UserService,
    private _globalService: GlobalService
  ) {
    this.url = this._globalService.url;
    this.identity = this._userService.getIdentity();
  }

  ngOnInit() {}

  logout() {
    localStorage.removeItem('identity');
    localStorage.removeItem('token');
    window.location.reload();
  }

}