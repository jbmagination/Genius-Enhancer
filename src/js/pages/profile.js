/**
 * @license
 * This code is licensed under the terms specified in the "LICENSE.md" file
 * located in the root directory of the project. The license file can also be found at
 * https://github.com/Uri6/Genius-Enhancer/blob/main/LICENSE.md
 */

export async function handleProfile(tabId, url) {
    await chrome.scripting.insertCSS(
        {
            target: { tabId: tabId },
            files: ["./src/css/pages/profile.css"]
        }
    );

    if (url.toLowerCase().endsWith("/uri6")) {
        await chrome.scripting.executeScript(
            {
                target: { tabId: tabId },
                files: ["./lib/particles/particles.min.js"]
            }
        );
    }

    await chrome.scripting.executeScript(
        {
            target: { tabId: tabId },
            func: () => {
                // if exists, remove the inner text (without removing the svg child) of the elements that have the class "u-quarter_vertical_margins" and at least one of the following classes: square_button--facebook, square_button--twitter, square_button--instagram
                // the inner text is the username in the social media
                const socialMediaButtons = $(".square_button--facebook, .square_button--twitter, .square_button--instagram").filter((i, el) => $(el).hasClass("u-quarter_vertical_margins"));

                if (window.location.pathname.includes("artists/")) {
                    // noinspection JSJQueryEfficiency
                    if ($(".copy_id_button").length) {
                        return;
                    }

                    const id = $("meta[name='newrelic-resource-path']").attr("content")?.split("/artists/")?.[1];
                    if (id) {
                        $("<div>", {
                            class: "copy_id_button text_label text_label--purple u-horizontal_margins u-top_margin u-half_bottom_margin cursor_pointer",
                            text: "Copy Artist ID"
                        }).insertAfter($("profile-artist-pane"));

                        $(".copy_id_button").on("click", () => {
                            navigator.clipboard.writeText(id);
                        });
                    }
                }

                if (socialMediaButtons.length && !$(".social_media_buttons_container").length) {
                    const dict = {
                        "square_button--facebook": "Facebook",
                        "square_button--twitter": "Twitter",
                        "square_button--instagram": "Instagram"
                    };

                    const socialMediaIcons = {
                        "Facebook": chrome.runtime.getURL("src/imgs/socialMediaIcons/facebook.svg"),
                        "Twitter": chrome.runtime.getURL("src/imgs/socialMediaIcons/twitter.svg"),
                        "Instagram": chrome.runtime.getURL("src/imgs/socialMediaIcons/instagram.svg")
                    };

                    const socialMediaIconsArray = Object.entries(socialMediaIcons);

                    // its a dictionary of the social media name and the username
                    const socialMediaUsernames = socialMediaButtons.map((i, el) => {
                        const classes = $(el).attr("class").split(" ");
                        const socialMediaName = classes.find(className => className in dict);

                        if (socialMediaName === "square_button--facebook") {
                            return {
                                [dict[socialMediaName]]: "@" + $(el).text().trim()
                            };
                        }

                        return {
                            [dict[socialMediaName]]: $(el).text().trim()
                        };
                    }).get();

                    const socialMediaNames = socialMediaButtons.map((i, el) => {
                        const classes = $(el).attr("class").split(" ");
                        const socialMediaName = classes.find(className => className in dict);
                        return dict[socialMediaName];
                    }).get();

                    // hide the old buttons, and for each social media button, create a new modern-look button with the social media name as the title attr
                    socialMediaButtons.hide();

                    const socialMediaButtonsContainer = $("<div>", {
                        class: "social_media_buttons_container"
                    });

                    socialMediaNames.forEach(socialMediaName => {
                        $("<div>", {
                            class: "social_media_button ",
                            title: socialMediaName
                        })
                            .append($("<div>", {
                                class: "social_media_button_icon"
                            })
                                .append($("<img>", {
                                    src: socialMediaIconsArray.find(icon => icon[0] === socialMediaName)[1]
                                }))
                            )
                            .append($("<div>", {
                                class: "social_media_button_username",
                                text: socialMediaUsernames.find(username => Object.keys(username)[0] === socialMediaName)[socialMediaName]
                            }))
                            .appendTo(socialMediaButtonsContainer);
                    });

                    // add the buttons as a child of the element with the tag name "profile-artist-pane", and before the element with the attribute "ng-init" equal to "$ctrl.show_leaderboard = true"
                    socialMediaButtonsContainer.insertBefore($("profile-artist-pane").find("[ng-init='$ctrl.show_leaderboard = true']"));

                    socialMediaButtonsContainer.find(".social_media_button").each((i, el) => {
                        $(el).click(() => {
                            socialMediaButtons[i].click();
                        });
                    });
                }

                // noinspection JSJQueryEfficiency
                if (!$(".copy_id_button").length) {
                    // get the id from the `twitter:app:url:iphone` meta tag
                    const id = $("meta[property='twitter:app:url:iphone']").attr("content")?.split("/")?.[3];

                    if (id) {
                        $("<div>", {
                            class: "copy_id_button text_label text_label--purple u-horizontal_margins u-top_margin u-half_bottom_margin cursor_pointer",
                            text: "Copy User ID"
                        }).insertBefore($("profile-admin-pane"));

                        $(".copy_id_button").on("click", () => {
                            navigator.clipboard.writeText(id);
                        });
                    }
                }

                if (window.location.href.toLowerCase().endsWith("/uri6")) {
                    const geDeveloper = $(".profile_identity_and_description").find("img").first();

                    if (geDeveloper.length) {
                        geDeveloper.wrap("<div class='ge-developer-image' id='ge-developer-image'></div>");
                        geDeveloper.hover(() => {
                            particlesJS.load("ge-developer-image", chrome.runtime.getURL("/lib/particles/particles.json"));
                        }, () => {
                            particlesJS("ge-developer-image", {});
                        });

                        $('#ge-developer-image').on('mouseleave', () => {
                            $('#ge-developer-image canvas').remove();
                        });
                    }
                }
            }
        });
}
