import {Component} from "@angular/core";
import {GitHub, Repository, Organization} from "./github.service";

@Component({
    selector: "Repositories",
    templateUrl: "repositories.component.html",
    providers: [GitHub]
})
export class RepositoriesComponent {

    private _searchText: string;

    results: Repository[];

    constructor(private github: GitHub) {
        console.log("Create RepositoriesComponent");
        // this.github
        //     .request("orgs", "NativeScript", "repos")
        //     .then(
        //         repos => this.repositories = repos,
        //         error => console.log("Error: " + error)
        //     );
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
        this.github.request("search", "repositories", { q: text }).then(
            result => {
                console.log("Success: " + result.items.map(r => r.full_name).join(", "));
                this.results = result.items;
            },
            error => console.log("Error: " + error)
        );
    }
}
