import { Injectable, Input, Output, EventEmitter, provide, NgZone } from '@angular/core';
import { Http, RequestMethod } from '@angular/http';
import {Headers} from '@angular/http';
import 'rxjs/add/operator/toPromise';
import * as utils from "utils/utils";

@Injectable()
export class GitHub {
    private static instance: GitHub = null;
    public static getInstance(http: Http, zone: NgZone): GitHub {
        if (GitHub.instance === null) {
            GitHub.instance = new GitHub(http, zone);
        }
        return GitHub.instance;
    }

    private static access_token: string;
    private static id: number = 0;
    private id: number;

    public authenticatedUser: User;

    constructor(private http: Http, public zone: NgZone) {
        this.id = GitHub.id ++;
        console.log("New GitHub instance! " + this.id);
    }

    @Output() authorizedChange = new EventEmitter();

    public get authorized(): boolean { return !!GitHub.access_token; }

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

    request(user: "user", repos: "repos", UserReposQuery): Promise<Repository[]>;

    /**
     * Get the authenticated user details.
     */
    request(user: "user"): Promise<User>;    

    request(repos: "repos", owner: string, repo: string, issues: "issues", query?: IssuesQuery): Promise<Issue[]>;

    request(... args: any[]): any;
    request(... args: (string | {})[]): any {
        let querryUri = "https://api.github.com/";
        querryUri += args.filter(s => typeof s === "string").join("/");
        let last = args[args.length - 1];
        let params = typeof last === "object" ? last : undefined;
        if (params || GitHub.access_token) {
            querryUri += "?";
            let separate = false;
            for(let key in params) {
                // TODO: Url escape
                querryUri += (separate ? "&" : "") + key + "=" + params[key];
                separate = true;
            }
            if (GitHub.access_token) {
                querryUri += (separate ? "&" : "") + "access_token" + "=" + GitHub.access_token;
                separate = true;
            }
        }
        console.log("Querry: " + querryUri);
        return this.http.get(querryUri)
            .toPromise()
            .then(response => Promise.resolve(response.json()));
    }

    requestOAuth() {
        // TODO: Create **state** and store it for safe keeping untill exchangeForAccessToken is called.
        utils.openUrl("https://github.com/login/oauth/authorize?client_id=ddad3314e37c5efbf57f&allow_signup=true&scope=repo,user");
    }

    exchangeForAccessToken(params: { code: string, state: string }) {
        console.log("exchangeForAccessToken: " + params.code + " " + this.id);
        // TODO: Verify **state**
        console.log("exchangeForAccessToken " + params.code + " " + params.state);
        let url = "https://github.com/login/oauth/access_token";
        url += "?client_id=ddad3314e37c5efbf57f";
        url += "&client_secret=304bc86ebc19fa0de7dcdbf8bb9afdbbad45d639";
        url += "&code=" + params.code;

        this.http.post(url, "", {
            headers: new Headers({ Accept: "application/json" })
        }).toPromise().then(result => {
            // TODO: What if result.status !== 200
            console.log("Result from OAuth:");
            console.log(result.status);
            let resultJson: {
                access_token: string,
                token_type:"bearer",
                scope: string,
            } = result.json();
            console.log("result " + this.id + " " + JSON.stringify(resultJson));

            // TODO: Revoke existing tokens and persist the access_token for later use (even after app restart)...
            this.zone.run(() => {
                GitHub.access_token = resultJson.access_token;
                this.authorizedChange.emit({});
                console.log("in NgZone " + this.zone);

                this.requestUser();
            });
        }).catch(error => {
            console.log("OAuth error: " + error);
        });
    }

    private requestUser() {
        this.request("user").then(user => {
            this.zone.run(() => {
                this.authenticatedUser = user;
            });
        })
    }
}

export const GITHUB_SERVICE_PROVIDER = [
    provide(GitHub, {
        deps: [Http, NgZone],
        useFactory: (http: Http, zone: NgZone): GitHub => {
            return GitHub.getInstance(http, zone);
        }
    })
];

export interface Organization {
    name: string;
}

export interface Repository {
    name: string;
    full_name: string;
    forks: number;
    open_issues: number;
    watchers: number;
    private: boolean;
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

export interface UserReposQuery {
    visibility?: "all" | "public" | "private";
    
    /**
     * Comma-separated list of values.
     * Default: "owner,collaborator,organization_member".
     */
    affiliation?: "owner" | "collaborator" | "organization_member" | string;
    type: "all" | "owner" | "public" | "private" | "member";
    sort: "created" | "updated" | "pushed" | "full_name";
    direction: "asc" | "desc";
}

export interface User extends Owner {
    location: string;
    email: string;
    bio: string;
    name: string;
}