"use strict";
var core_1 = require("@angular/core");
// TODO: JSONP?
var github_1 = require("./service/github");
var AppComponent = (function () {
    function AppComponent(github) {
        this.github = github;
        this.counter = 16;
        this.repositories = this.github.request("orgs", "NativeScript", "repos");
        console.log("Repositories: " + this.repositories);
    }
    Object.defineProperty(AppComponent.prototype, "message", {
        get: function () {
            if (this.counter > 0) {
                return this.counter + " taps left!";
            }
            else {
                return "Hoorraaay! \nYou are ready to start building!";
            }
        },
        enumerable: true,
        configurable: true
    });
    AppComponent.prototype.onTap = function () {
        this.counter--;
    };
    AppComponent = __decorate([
        core_1.Component({
            selector: "my-app",
            templateUrl: "app.component.html",
            providers: [github_1.GitHub]
        }), 
        __metadata('design:paramtypes', [github_1.GitHub])
    ], AppComponent);
    return AppComponent;
}());
exports.AppComponent = AppComponent;
//# sourceMappingURL=app.component.js.map