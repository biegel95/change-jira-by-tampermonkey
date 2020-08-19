// ==UserScript==
// @name         Jira
// @namespace    http://tampermonkey.net/
// @match        https://saipos.atlassian.net/jira/software/projects/SP/boards/15*
// @grant        none
// @require https://code.jquery.com/jquery-latest.js
// ==/UserScript==
(function() {
    'use strict';

    const GET_ALL_ISSUES = {
        URL: 'https://saipos.atlassian.net/rest/api/2/search?jql=project%20%3D%20SP',
        BODY: {
            "expand": [],
            "jql": "project = SP",
            "maxResults": 100,
            "fields": [
                "customfield_10311", // revisor
                "created",
                "priority",
                "updated",
                "customfield_10319", // testador,
                "customfield_10100", // date que nao sei pra q serve
                "statuscategorychangedate",
                "customfield_10313" // start dev
            ],
            "startAt": 0
        }
    }

    const USER_AUTH = 'guilherme.biegelmeyer@saipos.com:xTMcnM4bDaxpb7rfNSOID651'

    const colors = {
        'warning': {
            'color': 'rgb(255 182 182 / 51%)'
        }
    };

    const setDateCard = (type, date, key) => {
        // 1 - criacao
        // 2 - start dev
        // 3 - move status
        try {
            if (type === 1) {
                const checkExists = document.getElementById("created-saipos-" + key);
                if (checkExists) {
                    return;
                }
            } else if (type === 2) {
                const checkExists = document.getElementById("started-dev-saipos-" + key);
                if (checkExists) {
                    return;
                }
            }

            const divParent = document.getElementById("card-" + key);
            if (divParent) {
                const div1 = divParent.children[0];
                const div2 = div1.children[1];
                let div3 = div2.children[0];
                if (div2.children.length >= 3) {
                    div3 = div2.children[1];
                }
                const div4 = div3.children[0];
                const span1 = div4.children[0];
                const span2 = span1.children[0];
                const span2Cloned = span2.cloneNode(true);
                if (type === 1) {
                    span2.textContent = 'Criada ha ' + formatDate(date);
                    span2.setAttribute('id', 'created-saipos-' + key);
                    span2.style.float = 'left';
                    span2.style.width = '100%';
                    //span2.style.textAlign = 'right';
                    span2.style.color = '#383838';
                    span2.style.fontSize = '12px';
                } else if (type === 2) {
                    span2Cloned.textContent = 'Iniciada ha ' + formatDate(date);
                    span2Cloned.setAttribute('id', 'started-dev-saipos-' + key);
                    span2Cloned.style.float = 'left';
                    span2Cloned.style.width = '100%';
                    //span2Cloned.style.textAlign = 'right';
                    span2Cloned.style.color = '#383838';
                    span2Cloned.style.fontSize = '12px';
                }
                span1.appendChild(span2Cloned);
            }
        } catch(err) {

        }
    }

    const changeColor = (key, type) => {
        const divParent = document.getElementById("card-" + key);
        if (divParent) {
            //divParent.getElementsByClassName("sc-cTjmhe")[0].style.background = colors[type].color;
        }
    }

    const setReviewQA = (key, value, retry = 0) => {
        try {
            //if (key !== 'SP-1467') return;

            const divCRQA = document.getElementById("CR-QA-" + key);
            if (!divCRQA) {
                if (retry > 1) return;
                setTimeout(() => {
                    setReviewQA(key, value, retry + 1);
                }, 1000);
                return;
            }

            const divQA = divCRQA.children[1];
            divQA.children[0].style.display = 'flex';
            divQA.children[1].style.display = 'flex';
            divQA.children[0].children[0].style.display = 'none';
            divQA.children[0].children[1].children[0].children[0].children[0].textContent = ':QA';
            divQA.children[0].children[1].children[0].style.marginLeft = '50px';
            divQA.children[1].children[0].style.display = 'none';
            divQA.children[1].children[1].children[0].children[0].children[0].children[0].style.backgroundImage = `url(${value[0].avatarUrls['48x48']})`;
            //divQA.children[1].children[1].children[0].children[0].style.marginRight = '50px';

            if (value && value.length > 1) {
                const parentImg = divQA.children[1].children[1].children[0].children[0].children[0];
                let idx = 0;
                for (const reviewer of value) {
                    if (idx >= 1) {
                        const clonedImg = divQA.children[1].children[1].children[0].children[0].children[0].children[0].cloneNode(true);
                        clonedImg.style.backgroundImage = `url(${reviewer.avatarUrls['48x48']})`
                        parentImg.appendChild(clonedImg);
                    }
                    idx++;
                }
            }
        } catch(err) {

        }
    }

    const setReview = (key, value) => {
        try {
            //if (key !== 'SP-1467') return;

            const divParent = document.getElementById("card-" + key);
            if (divParent) {
                const checkExists = document.getElementById("CR-QA-" + key);
                if (checkExists) {
                    return;
                }

                const div1 = divParent.children[0];
                const div2 = div1.children[1];
                let div3 = div2.children[0];
                if (div2.children.length >= 3) {
                    div3 = div2.children[1];
                }
                const div4 = div3.children[2];
                const div4Cloned = div4.cloneNode(true);
                div4Cloned.setAttribute('id', 'CR-QA-' + key);
                div3.appendChild(div4Cloned);

                let divCR = document.getElementById("CR-QA-" + key);
                let divQA = divCR.children[0].cloneNode(true)
                divCR.appendChild(divQA);

                const divCRQA = document.getElementById("CR-QA-" + key);
                divCR = divCRQA.children[0];
                divCR.children[0].children[0].style.display = 'none';
                divCR.children[0].children[1].children[0].children[0].children[0].textContent = ':CR';
                divCR.children[1].children[0].style.display = 'none';
                divCR.children[1].children[1].children[0].children[0].children[0].children[0].style.backgroundImage = `url(${value[0].avatarUrls['48x48']})`;
                divCR.children[1].children[1].children[0].children[0].style.marginRight = '50px';

                if (value && value.length > 1) {
                    const parentImg = divCR.children[1].children[1].children[0].children[0].children[0];
                    let idx = 0;
                    for (const reviewer of value) {
                        if (idx >= 1) {
                            const clonedImg = divCR.children[1].children[1].children[0].children[0].children[0].children[0].cloneNode(true);
                            clonedImg.style.backgroundImage = `url(${reviewer.avatarUrls['48x48']})`
                            parentImg.appendChild(clonedImg);
                        }
                        idx++;
                    }
                }

                const divReviewer = divCRQA.children[1];
                divReviewer.children[0].style.display = 'none';
                divReviewer.children[1].style.display = 'none';
            }
        } catch(err) {

        }
    }

    const getAllIssues = (count_searched = 0) => {
        GET_ALL_ISSUES.BODY.startAt = count_searched;
        const request = new XMLHttpRequest();
        request.open("POST", GET_ALL_ISSUES.URL);
        request.setRequestHeader('Content-Type', 'application/json')
        request.setRequestHeader("Authorization", "Basic " + btoa(USER_AUTH))
        request.send(JSON.stringify(GET_ALL_ISSUES.BODY));
        request.onreadystatechange = (e) => {
            processResponseGetAllIssues(request.responseText);
        }
    }

    const processResponseGetAllIssues = (response) => {
        try {
            if (!response) return;

            response = JSON.parse(response);
            const issues = response.issues

            if (!issues || !issues.length) return;

            if (GET_ALL_ISSUES.BODY.startAt < response.total) {
                console.log("GET_ALL_ISSUES.BODY.startAt", GET_ALL_ISSUES.BODY.startAt)
                getAllIssues(GET_ALL_ISSUES.BODY.startAt + 100)
            }

            for (const issue of issues) {
                readyIssue(issue);
            }
        } catch(err) {
            console.log("error", err)
        }
    }

    const readyIssue = (issue) => {
        if (!issue) return;

        const key = issue.key;

        //if (key !== 'SP-724') return;

        for (const field in issue.fields) {
            readyField(field, issue.fields[field], key);
        }
    }

    const formatDate = (date) => {
        let str = '';

        const date1 = new Date(date);
        const date2 = new Date();

        const diffToMin = Math.abs(date1 - date2);
        let minutes = Math.floor((diffToMin/1000)/60);

        if (minutes<60) {
            str = minutes + ' minutos';
            return str;
        }

        const hours = Math.abs(date1 - date2) / 36e5;

        let diffDays = hours/24;
        diffDays = parseInt(diffDays);

        let diffHours = hours - (diffDays*24)
        diffHours = parseInt(diffHours);

        if (diffDays) {
            str = diffDays + ' dia(s)';

            if (diffHours) {
                str+= ' e ' + diffHours + ' hora(s)';
            }
        } else if (diffHours) {
            str = diffHours + ' horas';
        }

        return str;
    }

    const readyField = (keyField, valueField, keyCard) => {
        if (!keyField || !valueField) return;

        if (keyField === 'created') {
            setDateCard(1, valueField, keyCard);
        } else if (keyField === 'customfield_10311') {
            setReview(keyCard, valueField)
        } else if (keyField === 'customfield_10319') {
            setReviewQA(keyCard, valueField)
        } else if (keyField === 'customfield_10313') {
            setDateCard(2, valueField, keyCard);
        }

        return;
    }

    try {
        setInterval(function() {
            getAllIssues();
        }, 300000);

        console.log("starting tamper monkey...")
        setTimeout(function() {
            getAllIssues();
        }, 6000);

        $("fieldset").click(function() {
            getAllIssues();
        });
    } catch(err) {
        console.log("erro tampermonkey", err);
    }
})();