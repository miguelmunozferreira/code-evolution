import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';


@Component({
    selector: 'app-level-list',
    templateUrl: '../views/level_list.html',
    providers: []
})

export class LevelListComponent implements OnInit {

    public title: string;
    
    constructor(
        private _route: ActivatedRoute,
        private _router: Router
    ) {
        this.title = 'Seleccione un nivel';        
    }

    ngOnInit() {
        //Comprobar si el usuario ha llegado a dicha evolución
    }

}