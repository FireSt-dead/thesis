import {Component} from "@angular/core";
import {GitHub, Repository, Organization} from "./github.service";
import {ItemEventData} from "ui/list-view";
import {Router} from "@angular/router";

@Component({
    selector: "Repositories",
    templateUrl: "repositories.component.html",
    styleUrls: ["repositories.component.css"],
    providers: [GitHub]
})
export class RepositoriesComponent {

    private _searchText: string;

    public repositories: Repository[];
    public loading: boolean = false;

    constructor(private github: GitHub, private router: Router) {
        console.log("Create RepositoriesComponent");
    }

    public get searchText(): string {
        return this._searchText;
    }
    public set searchText(value: string) {
        this._searchText = value;
        console.log("Search: " + value);
    }

    public onClear() {
        console.log("onClear");
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
        this.router.navigate(["/repository", encodeURIComponent(repo.owner.login), encodeURIComponent(repo.name) ]);
    }
}
