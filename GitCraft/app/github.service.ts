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

    /**
     * Get repository by owner and repository names.
     */
    request(repos: "repos", owner: string, repo: string): Promise<Repository>;

    /**
     * Get milestones for repository by owner and repository names.
     * Example query: https://api.github.com/repos/NativeScript/NativeScript/milestones
     */
    request(repos: "repos", owner: string, repo: string, milestones: "milestones", querry?: MilestonesQuery): Promise<Milestone[]>;

    request(repos: "repos", owner: string, repo: string, issues: "issues", query?: IssuesQuery): Promise<Issue[]>;

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
                separate = true;
            }
        }
        console.log("Querry: " + querryUri);
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

export interface SearchQuerry {
    q: string;
    sort?: SearchSort;
    order?: Order;
}
export interface SearchResult<T> {
    total_count: number;
    incomplete_results: boolean;
    items: Repository[];
}

export interface MilestonesQuery {
    state?: "open" | "closed" | "all";
    sort?: "due_on" | "completeness";
    direction?: "asc" | "desc";
}

export interface Milestone {
    title: string;
    id: number;
    number: number;
    description: string;

    creator: Owner;

    open_issues: number;
    closed_issues: number;
    state: "open" | "closed";

    /**
     * Created at date in a string format: 2016-07-26T11:21:43Z.
     */
    created_at: string;

    /**
     * Created at date in a string format: 2016-07-26T11:21:43Z.
     */
    updated_at: string;

    /**
     * Created at date in a string format: 2016-07-26T11:21:43Z.
     */
    due_on: string;

    /**
     * Created at date in a string format: 2016-07-26T11:21:43Z.
     */
    closed_at: string;
}

interface IssuesQuery {
    milestone?: number | "none" | "*";
    state?: "all" | "open" | "closed";
    assignee?: string | "*" | "none";
    creator?: string;
    mentioned?: string;

    /**
     * A list of comma separated label names. Example: bug,ui,@high
     */
    labels?: string;

    /**
     * What to sort results by. Can be either created, updated, comments. Default: created
     */
    sort?: string;

    direction?: "asc" | "desc";

    /**
     * Only issues updated at or after this time are returned. This is a timestamp in ISO 8601 format: YYYY-MM-DDTHH:MM:SSZ.
     */
    since?: string;
}

export interface Issue {
    id: number;
    number: number;
    title: string;
    user: Owner;
    labels: Label[];
    state: "open" | "closed";
    locked: boolean;
    asignee: Owner;
    asignees: Owner[];
    milestone: Milestone;
    comments: number;

    created_at: string;
    updated_at: string;
    closed_at: string;
    body: string;
}

export interface Label {
    name: string;
    color: string;
}