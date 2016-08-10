var api_github_1 = require("../api-github/api-github");
var fs = require('fs');
var _a = JSON.parse(fs.readFileSync("secret.json")), username = _a.username, password = _a.password;
describe("api.github", function () {
    this.timeout(100000);
    it("integration", function () { return api_github_1.default("user", { username: username, password: password }).then(function (user) {
        return Promise.all([
            api_github_1.default("users", user.login, "starred"),
            api_github_1.default("users", user.login, "subscriptions"),
            api_github_1.default("users", user.login, "repos"),
            api_github_1.default("users", user.login, "orgs")
        ]).then(function (_a) {
            var starred = _a[0], subscriptions = _a[1], repos = _a[2], orgs = _a[3];
            console.log("User: " + user.login);
            console.log(" - starred:");
            starred.forEach(function (repo) { return console.log("   ★ " + repo.full_name); });
            console.log(" - subscribed:");
            subscriptions.forEach(function (repo) { return console.log("   - " + repo.full_name); });
            console.log(" - repos:");
            repos.forEach(function (repo) { return console.log("   - " + repo.full_name); });
            console.log(" - member of org:");
            orgs.forEach(function (org) {
                console.log("   - " + org.login);
                console.log("     " + org.description);
            });
        });
    }); });
    it("user login", function () {
        return api_github_1.default("user", { username: username, password: password }).then(function (user) {
            // console.log("User: " + user.login);
        });
    });
    it("issues", function (done) {
        api_github_1.default("repos", "NativeScript", "NativeScript", "issues", { milestone: 17, state: "all" }).then(function (issues) {
            issues.forEach(function (issue) {
                //console.log(" - " + issue.title);
            });
            done();
        }).catch(done);
    });
    it("milestone", function (done) {
        api_github_1.default("repos", "NativeScript", "NativeScript", "milestones", { state: "all" }).then(function (milestones) {
            milestones.forEach(function (milestone) {
                //console.log(" - " + milestone.title + ", issues: " + milestone.open_issues + "/" + milestone.closed_issues + " (" + milestone.state + ")");
            });
            done();
        }).catch(done);
    });
    it("orgs <name> repos", function (done) {
        api_github_1.default("orgs", "NativeScript", "repos").then(function (repos) {
            repos.forEach(function (repo) {
                //console.log(" - " + repo.full_name + " ★" + repo.stargazers_count /* + " 👁" + repo.subscribers_count */);
            });
            done();
        }).catch(done);
    });
});
//# sourceMappingURL=test.js.map