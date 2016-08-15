import { Injectable } from '@angular/core';
import { Http, RequestMethod } from '@angular/http';
import 'rxjs/add/operator/toPromise';

@Injectable()
export class GitHub {
    constructor(private http: Http) {}

    /**
     * Get the repositories for an organization by name.
     * Example query: https://api.github.com/search/repositories?q=native
     */
    request(orgs: "orgs", name: string, repos: "repos"): Promise<Repository[]>;

    /**
     * Search for repositories.
     * Example query: https://api.github.com/search/repositories?q=native
     */
    request(search: "search", what: "repositories", querry: SearchQuerry): Promise<SearchResult<Repository>>;

    request(... args: any[]): any;
    request(... args: (string | {})[]): any {
        let querryUri = "https://api.github.com/";
        querryUri += args.filter(s => typeof s === "string").join("/");
        let last = args[args.length - 1];
        let params = typeof last === "object" ? last : undefined;
        if (params) {
            querryUri += "?";
            let separate = false;
            for(let key in params) {
                // TODO: Url escape
                querryUri += (separate ? "&" : "") + key + "=" + params[key];
            }
        }
        
        return this.http.get(querryUri)
            .toPromise()
            .then(response => Promise.resolve(response.json()));
    }
}

export interface Organization {
    name: string;
}

export interface Repository {
    name: string;
    full_name: string;
    forks: number;
    open_issues: number;
    watchers: number;

    owner: Owner;
}

export interface Owner {
    login: string;
    avatar_url: "";
    gavatar_id: string;
    type: "Organization" | "User";
}

export type SearchSort = "stars" | "forks" | "updated";
export type Order = "asc" | "desc";

interface SearchQuerry {
    q: string;
    sort?: SearchSort;
    order?: Order;
}
interface SearchResult<T> {
    total_count: number;
    incomplete_results: boolean;
    items: Repository[];
}