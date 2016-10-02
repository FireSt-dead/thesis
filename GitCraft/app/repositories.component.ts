import {Component, OnInit, OnDestroy, NgZone} from "@angular/core";
import {GitHubService, Repository, Organization} from "./github.service";
import {ItemEventData} from "ui/list-view";
import {Router} from "@angular/router";
import {Location} from '@angular/common';

@Component({
    selector: "Repositories",
    templateUrl: "repositories.component.html",
    styleUrls: ["repositories.component.css"]
})
export class RepositoriesComponent implements OnInit, OnDestroy {

    private _searchText: string;

    public repositories: Repository[];
    public loading: boolean = false;
    private authorizeChangeSubscription: any;

    constructor(private github: GitHubService, private router: Router, private zone: NgZone, private location: Location) {
        console.log("Create RepositoriesComponent!");
    }

    ngOnInit() {
        this.authorizeChangeSubscription = this.github.authorizedChange.subscribe(next => {
            if (this.github.authorized && !this.repositories) {
                this.listOwnRepos();
            }
        });
    }

    ngOnDestroy() {
        this.authorizeChangeSubscription.unsubscribe();
    }

    public get searchText(): string {
        return this._searchText;
    }
    public set searchText(value: string) {
        this._searchText = value;
        console.log("Search: " + value);
    }

    private listOwnRepos() {
        if (!this.github.authorized) {
            return;
        }

        console.log("List own repos!");
        this.loading = true;
        this.github.request("user", "repos").then(
            result => {
                this.zone.run(() => {
                    this.repositories = result;
                    this.loading = false;
                });
            },
            error => {
                console.log("Error: " + error);
                this.loading = false;
            }
        );
    }

    public onClear() {
        console.log("onClear");
        this.listOwnRepos();
    }

    public onSearch(text: string) {
        console.log("onSearch: " + text);
        this.loading = true;
        this.github.request("search", "repositories", { q: text }).then(
            result => {
                console.log("Success: " + result.items.map(r => r.full_name).join(", "));
                this.repositories = result.items;
                this.loading = false;
            },
            error => console.log("Error: " + error)
        );
    }

    public onRepositoryTap(args: ItemEventData) {
        let repo = this.repositories[args.index];
        console.log("Tapped on " + repo.name);
        this.router.navigate(["/repos", encodeURIComponent(repo.owner.login), encodeURIComponent(repo.name) ]);
    }

    public onAuthenticateTap() {
        this.github.requestOAuth();
    }
}
