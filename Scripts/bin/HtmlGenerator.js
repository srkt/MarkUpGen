(function () {

    function HtmlGenerator(options) {

        var defaultOpts = {
            parentId: undefined,
            pattern: undefined
        };

        var pattern;

        if (typeof options === 'string') {
            pattern = options;
        }

        if (options && typeof options === 'object') {
            for (var option in options) {
                if (options.hasOwnProperty(option)) {
                    defaultOpts[option] = options[option];
                }
            }
            pattern = defaultOpts.pattern;
        }




        if (!pattern || typeof pattern !== 'string') {
            throw new Error('invalid pattern passed');
        }

        var breakpoints = ">^+",
    attributes = ".#@",
    hierarchyCheck = 0,
    attrMapper = {
        '.': 'class',
        '#': 'id',
        '@': 'attribute'
    },
    elementArray,
    breakpointArray,
    finalElement = {},
    classRegex = new RegExp('-?[_a-zA-Z]+[_a-zA-Z0-9-]*', 'i'),
    idRegex = new RegExp('^[a-zA-Z]+[a-zA-Z0-9-_:.]*', 'i'),
    attributeName = new RegExp('^[a-zA-Z][a-zA-Z0-9]+', 'i'),
    dataRegex = new RegExp('\\[\\[[a-zA-Z].*\\]\\]', 'i'), //{{[a-zA-Z][a-zA-Z0-9]+\s*}}
    // attributeValue = new RegExp('.*[' + breakpoints + ']$', 'i'),
    subgroupPattern = /(?:\()([^\(\)]*)(?:\))(?:\*)(\d+)?/i,
    currentElemIndex = 0,
    heirarchyIndex = 0,
    bpval = {
        "+": 0,
        ">": 1,
        "^": -1
    },
    tempElem = 'div.temp-elem@style=display:none;';;
        this.tempElem = tempElem;

        pattern = flattenPattern(pattern);

        this.flattenPattern = flattenPattern;


        var domPattern = "",
          dom = "";

        this.ep = HtmlGenerator.prototype;

        domPattern = (defaultOpts.parentId || '') + ".parent-emmetter" + (!pattern ? "" : ">" + pattern);

        this.editPattern = function (pattern) {
            domPattern = domPattern + (pattern || "");
        };

        this.clearPattern = function (pattern) {
            domPattern = "";
        };

        this.toString = function () {
            return domPattern;
        };



        function isValidClassName(str) {
            return classRegex.test(str);
        }

        function isValidId(str) {
            return idRegex.test(str);
        }

        function isValidAttributeName(str) {
            return attributeName.test(str);
        }

        function isValidAttributeValue(str) {
            return true;
            // return attributeValue.test(str);
        }


        this.addBreakpoints = function (breakpoint) {

            if (typeof breakpoint !== 'string')
                return;

            breakpoints = breakpoints + breakpoint;

        };

        this.removeBreakpoint = function (breakpoint) {

            if (typeof breakpoint !== 'string')
                return;

            if (breakpoints.indexOf(breakpoint) === -1)
                return;

            var reg = new RegExp("'" + breakpoint + "'", 'gi');

            breakpoints = breakpoints.replace(reg, "");

        };


        function isArray(arr) {
            return Object.prototype.toString.call(arr) === '[object Array]';
        }


        function flattenHierarchy() {

            var joined = [],
              flattenedDom = {};

            function join() {

                elementArray.forEach(function (x, i) {
                    joined.push(x);

                    if (breakpointArray[i])
                        joined.push(breakpointArray[i]);

                });

            }

            join();

            var level = 0;
            joined.forEach(function (x, i) {


                if (i % 2 === 0) {
                    if (!flattenedDom[level])
                        flattenedDom[level] = [];
                    flattenedDom[level].push(generateElement(x));
                } else {

                    if (x === '>') {
                        level = level + 1;
                    } else if (/^\^+$/.test(x)) {

                        x.split('').forEach(function (x) {
                            level = level - 1;

                            if (level < 1)
                                throw new Error('Invalid hierarchy found in expression');
                        });

                    }
                }

            });
            // //console.log(flattenedDom);



        }

        function checkHierarchy(arr) {

            if (!isArray(arr))
                throw Error('Invalid array');

            arr.forEach(function (x, idx) {


                if (x.length > 1) {
                    var sub = x.split("");

                    checkHierarchy(sub);

                }

                if (x === '>') {
                    hierarchyCheck++;
                } else if (x === '^') {
                    hierarchyCheck--;
                }


                if (hierarchyCheck < 1)
                    throw new Error('Invalid pattern provided');


            });

            hierarchyCheck = 0;

        }

        //elements: [".s", ".t", ".c.a", ".d#k.c", "s@test"],
        //heirarchy: [">", ">", "^^", ">"]

        function isClass(obj) {
            return obj === '.';
        }


        function isId(obj) {
            return obj === '#';
        }

        function isAttribute(obj) {
            return obj === '@';
        }

        function DomElement() {
            this.class = [];
            this.id = "";
            this.attributes = [];
            this.rightSibling = undefined;
            this.leftSibling = undefined;
            this.child = undefined;
            this.level = undefined;

            this.addChildElement = function (element) {
                this.child = element;
            };

            this.addSibling = function (element) {
                this.rightSibling = element;
            };
        }

        var elementStack = [];

        function generateElement(strPattern) {

            var element = {
                class: [],
                id: '',
                otherAttrs: {},
                elementType: 'div',
                level: -1,
                childElement: undefined,
                rightSibling: undefined
            },
              closingTag = "";


            // //console.log(elementStack.length);

            if (!strPattern || strPattern.length === 0) {
                throw new Error("Invalid pattern passed for dom generation");
            }

            var elem = "";

            var reg = new RegExp('([^a-zA-Z]+|[\\' + attributes + '])', 'g');
            var attrsplit = '(\\' + attributes.split('').join('|') + ')';
            reg = new RegExp(attrsplit, 'gi');

            var elemDetails = strPattern.split(reg);

            //         //console.log(elemDetails);

            var startElem = elemDetails[0];


            if (/[a-zA-Z]+/.test(startElem)) {
                elem = '<' + startElem + ' tempclass tempattr tempid >';
                element.elementType = startElem;

            } else if (startElem.length === 0) {
                elem = '<div  tempclass tempattr tempid ></div>';
            }


            for (var i = 1; i < elemDetails.length; i++) {

                var currentE = elemDetails[i];

                if (isClass(currentE)) {

                    if (!element.class)
                        element['class'] = [];

                    var cn = elemDetails[i + 1];
                    //   ;
                    ////console.log(!isValidClassName(cn));

                    if (!isValidClassName(cn))
                        throw new Error('invalid class name ' + cn);


                    element.class.push(cn);
                    i++;
                } else if (isId(currentE)) {

                    var id = elemDetails[i + 1];

                    if (!isValidId(id))
                        throw new Error('invalid id name ' + id);

                    element.id = id;
                    i++;

                } else if (isAttribute(currentE)) {

                    var attr = elemDetails[i + 1];

                    var an = attr.match(/^[a-zA-Z0-9-_\.]+/i),
                      av;


                    try {
                        av = attr.match(/=.*$/i).join('').replace('=', '');
                    } catch (e) {
                        av = undefined;
                    }

                    if (!isValidAttributeName(an))
                        throw new Error('invalid attribute name ');


                    if (av)
                        if (!isValidAttributeValue(av))
                            throw new Error('invalid attribute value');

                    element.otherAttrs[an] = av;

                }

            }

            heirarchyIndex = heirarchyIndex + 1;
            var hr = breakpointArray[heirarchyIndex];

            currentElemIndex = currentElemIndex + 1;

            if (currentElemIndex < elementArray.length) {


                if (hr === '>') {
                    elementStack.push(element);
                    element.level = heirarchyIndex;
                    updateHierarchyIndex(1);

                    element.childElement = generateElement(elementArray[currentElemIndex]);
                } else if (hr === '+') {
                    element.level = heirarchyIndex;
                    if (!element.rightSibling) element.rightSibling = [];
                    element.rightSibling.push(generateElement(elementArray[currentElemIndex]));
                } else {
                    element.level = heirarchyIndex;
                    var thr = hr.split('');
                    var tempelement;
                    thr.forEach(function (x) {
                        updateHierarchyIndex(-1);
                        tempelement = elementStack.pop();
                    });
                    if (!tempelement.rightSibling) tempelement.rightSibling = [];
                    tempelement.rightSibling.push(generateElement(elementArray[currentElemIndex]));

                }


            }

            return element;
        }

        function updateHierarchyIndex(val) {
            hierarchyCheck = hierarchyCheck + val;

            if (hierarchyCheck < 0)
                throw new Error("invalid pattern passed");
        }

        var refElem;

        function getsplitPatternToElementArray(pattern) {

            var attrsplitRegex = '(\\' + attributes.split('').join('|') + ')';

            var reg = new RegExp(attrsplitRegex, 'gi');

            return pattern.split(reg);

        }

        this.finalDomElement;

        function generateDomElement(strPattern) {


            // ;
            var element,
                closingTag = "";


            if (!strPattern || strPattern.length === 0) {
                throw new Error("Invalid pattern passed for dom generation");
            }

            var elem = "";


            var dataElem = strPattern.match(dataRegex);


            if (dataElem !== null) {
                dataElem = dataElem.join('');
                strPattern = strPattern.replace(dataRegex, '');

            }


            var elemDetails = getsplitPatternToElementArray(strPattern);

            //console.log(strPattern);

            //console.log(elemDetails);

            var startElem = elemDetails[0],
                tagName = 'div';


            if (/[a-zA-Z]+/.test(startElem)) {
                tagName = startElem;
            }

            element = document.createElement(tagName);


            for (var i = 1; i < elemDetails.length; i++) {

                var currentE = elemDetails[i];

                if (isClass(currentE)) {

                    var cn = elemDetails[i + 1];

                    if (!isValidClassName(cn))
                        throw new Error('invalid class name ' + cn);

                    element.classList.add(cn);

                    i++;
                } else if (isId(currentE)) {

                    var id = elemDetails[i + 1];

                    if (!isValidId(id))
                        throw new Error('invalid id name ' + id);

                    element.setAttribute("id", id);
                    i++;

                } else if (isAttribute(currentE)) {

                    var attr = elemDetails[i + 1];

                    var an = attr.match(/^[a-zA-Z0-9-_\.]+/i),
                        av;


                    try {
                        av = attr.match(/=.*$/i).join('').replace('=', '');
                    } catch (e) {
                        av = undefined;
                    }

                    if (!isValidAttributeName(an))
                        throw new Error('invalid attribute name ');


                    if (av)
                        if (!isValidAttributeValue(av))
                            throw new Error('invalid attribute value');

                    //element.otherAttrs[an] = av;
                    element.setAttribute(an, av);

                }

            }

            if (element.nodeType === 1 && dataElem !== null) {
                // var reg = /(?:(\[\[).*(\]\]$))/gi;
                //  //console.log(reg.exec(dataElem));
                element.innerHTML = dataElem.substring(2, dataElem.length - 2);
            }

            heirarchyIndex = heirarchyIndex + 1;
            var hr = breakpointArray[heirarchyIndex];
            var lastNode = null;

            currentElemIndex = currentElemIndex + 1;

            if (currentElemIndex < elementArray.length) {



                if (hr === '>') {
                    elementStack.push(element);
                    element.level = heirarchyIndex;
                    updateHierarchyIndex(1);


                    var childElem = generateDomElement(elementArray[currentElemIndex]);
                    var firstChild = element.childNodes[0];
                    element.insertBefore(childElem, firstChild);


                } else if (hr === '+') {
                    element.level = heirarchyIndex;

                    refElem = elementStack[elementStack.length - 1];


                    lastNode = refElem.hasChildNodes() ? refElem.childNodes[refElem.childNodes.length - 1] : null;

                    refElem.insertBefore(generateDomElement(elementArray[currentElemIndex]), lastNode);

                } else {

                    if (!/^\^+$/i.test(hr))
                        throw new Error('invalid breakpoint passed');

                    element.level = heirarchyIndex;
                    var thr = hr.split('');
                    var tempelement;
                    thr.forEach(function (x) {
                        updateHierarchyIndex(-1);
                        tempelement = elementStack.pop();
                    });

                    refElem = elementStack[elementStack.length - 1];

                    lastNode = refElem.hasChildNodes() ? refElem.childNodes[refElem.childNodes.length - 1] : null;
                    refElem.insertBefore(generateDomElement(elementArray[currentElemIndex]), lastNode);


                }


            }

            return element;


        }

        function removeTempElements(elm) {

            ;
            var tempelem = elm.getElementsByClassName('temp-elem');

            while (tempelem && tempelem.length) {

                for (var i = 0; i < tempelem.length; i++) {

                    if (tempelem[i].nodeType === 1) 
                        tempelem[i].parentNode.removeChild(tempelem[i]);


                }
                tempelem = elm.getElementsByClassName('temp-elem');
            }

            return elm;

        }

        function cleanElement(element) {
            return function (cleaningFunc) {

                if (typeof cleaningFunc !== 'function') {
                    return element;
                }

                return cleaningFunc(element);

            }
        };



        function buildDom() {


            heirarchyIndex = 0;
            var startElem = elementArray[currentElemIndex];


            var domEl = generateDomElement(startElem);
            //document.body.appendChild(domEl);

            return domEl;


        }

        this.getsplitPatternToElementArray = getsplitPatternToElementArray;

        function getJsRegex(pattern) {
            return new RegExp('[^' + pattern.trim() + ']+', 'g');
        }
        /*Converts somthing like .temp*4 => .temp+.temp+.temp+.temp */
        function expandPatternforMultiples(pattern) {

            var elems = [];

            if (/\*\d+$/i.test(pattern)) {
                var split = pattern.split("*");

                var tempelem = split[0],
                    multiple = parseInt(split[1]);

                if (isNaN(multiple)) {
                    throw new Error("Multiple should be an integer");
                }


                for (var jj = 0; jj < multiple; jj++) {
                    elems.push(tempelem);
                }

                return elems;


            } else {
                return pattern;
            }

        }

        /* .row>.col-md-12>(.row>.col-md-3*4)*2 ==> .row>.col-md-12>.row>.col-md-3*4^.row>.col-md-3*4 */
        function getPatternLevel(pattern) {

            var currentLevel = 0;

            var patReg = new RegExp('[^' + breakpoints.trim() + ']+', 'i');

            var hierarchy = pattern.split(patReg);
            hierarchy.pop();
            hierarchy.shift();

            hierarchy.forEach(function (x) {
                currentLevel = currentLevel + (bpval[x] || 0);
            });

            return currentLevel;

        }

        function expandElem(element) {


            var pattern = '';

            for (var i = 0; i < element.count; i++) {
                //console.log(element.level);
                pattern = pattern + (i > 0 ? '+' : '') + element.element + (element.level > 0 ? HtmlGenerator.multiply('^', element.level).join('') + tempElem : '');

            }

            element['expandedElement'] = pattern;


        }
        this.flattenPattern = flattenPattern;

        function flattenPattern(pattern) {

            debugger;
            var patternStack = [];

            if (!pattern)
                throw new Error('Invalid pattern passed');

            var patternCopy = pattern, count = 1;

            var matches = subgroupPattern.exec(patternCopy);

            if (!matches)
                return pattern;

            while (matches) {
                var elmInfo = {
                    placeholderId: count,
                    element: matches[1],
                    count: parseInt(matches[2] || 0)
                };

                patternStack.push(elmInfo);
                patternCopy = patternCopy.replace(subgroupPattern, '::' + count + '::');
                elmInfo['level'] = getPatternLevel(elmInfo.element);
                expandElem(elmInfo);

                count++;
                matches = subgroupPattern.exec(patternCopy);

                if (matches === null) {
                    patternStack.push({
                        placeholderId: count,
                        element: patternCopy,
                        expandedElement: patternCopy,
                        count: 0
                    });
                }
            }


            var finalResult = '';


            for (var i = 1; i < patternStack.length; i++) {

                var r = new RegExp('::' + i + '::', 'gi'),
                    currentElem = patternStack[i]['expandedElement'];
               //     prevElement = patternStack[i - 1]['expandedElement'];

               if(i===1)
               finalResult = patternStack[i - 1]['expandedElement'];

               finalResult = currentElem.replace(r, finalResult);
             //   patternStack[i - 1]['expandedElement'] = finalResult;

               // finalResult = finalResult + mdfiedElm;// currentElem.replace(r, prevElement);
            }

            if (patternStack.length === 1)
                finalElement = patternStack[0]['expandedElement'];



            return finalResult;

        }

        function multiply(pat, no) {

            var r = [];

            for (var i = 0; i < no; i++) {
                r.push(pat);
            }

            return r;
        }

        HtmlGenerator.multiply = multiply;

        function readjustElementPattern() {

            var elemCopy = [],
                hierarchyCopy = [];


            if (domPattern.length === 0)
                return;

            var hierearchyReg = new RegExp('[^' + breakpoints.trim() + ']+', 'g'),
                elementReg = new RegExp('[' + breakpoints.trim() + ']+', 'g');


            elementArray = domPattern.split(elementReg),
                breakpointArray = domPattern.split(hierearchyReg);

            breakpointArray.pop();
            breakpointArray.shift();
            breakpointArray.unshift("p");
            //checkHierarchy(hierarchies);

            //elementArray = elms;
            //breakpointArray = hierarchies;


            elementArray.forEach(function (elem, idx) {

                var resultElms = expandPatternforMultiples(elem);

                if (isArray(resultElms)) {
                    hierarchyCopy.push(breakpointArray[idx]);
                    elemCopy = elemCopy.concat(resultElms);
                    hierarchyCopy = hierarchyCopy.concat(multiply("+", resultElms.length - 1));

                } else {
                    elemCopy.push(resultElms);
                    hierarchyCopy.push(breakpointArray[idx]);
                }


            });


            elementArray = elemCopy;
            breakpointArray = hierarchyCopy;

            //console.log(elementArray);
            //console.log(breakpointArray);
        }

        this.getLevel = function () {

            var currentLevel = 0;

            if (!breakpointArray) {
                readjustElementPattern();
            }

            breakpointArray.forEach(function (x) {
                if (x.length > 1) {
                    x.split('').forEach(function (y) {
                        currentLevel = currentLevel + (bpval[y] || 0);
                    });
                } else {
                    currentLevel = currentLevel + (bpval[x] || 0);

                }
            });

            return currentLevel;

        }

        this.getPattern = function () {

            var result = [];

            if (!elementArray || !breakpointArray || !elementArray.length || !breakpointArray.length)
                readjustElementPattern();

            for (var i = 0; i < elementArray.length; i++) {

                result.push(elementArray[i]);

                if (i !== elementArray.length - 1)
                    result.push(breakpointArray[i + 1]);


            }

            return result.join('');


        };

        this.generateDom = function () {

            //flattenHierarchy();
            readjustElementPattern(); //readjusts for multiples
            var resultElem = buildDom();
            var cleanELem = cleanElement(resultElem);

            return cleanELem(removeTempElements);


        };
    }

    HtmlGenerator.prototype.addExternalEmmetter = function (emmetter) {

        var resultEmmetter = emmetter;
        //level = emmetter.getLevel(),
        //pat = level > 0 ? HtmlGenerator.multiply('^', level).join('') + this.tempElem : '';



        if (emmetter instanceof HtmlGenerator) {

            level = emmetter.getLevel(),
            pat = level > 0 ? HtmlGenerator.multiply('^', level).join('') + this.tempElem : '';
            //console.log(level);
            resultEmmetter = emmetter.toString() + pat;
        }

        if (typeof emmetter === 'string')
            resultEmmetter = this.flattenPattern(emmetter);

        return resultEmmetter;

    }

    HtmlGenerator.prototype.addChild = function (pattern) {

        if (!pattern)
            throw new Error("pattern not defined");

        pattern = this.addExternalEmmetter(pattern);


        this.editPattern(">" + pattern);
        return this;

    };

    HtmlGenerator.prototype.addSibling = function (pattern) {

        if (!pattern)
            throw new Error("pattern not defined");

        pattern = this.addExternalEmmetter(pattern);

        this.editPattern("+" + pattern);

        return this;
    };

    HtmlGenerator.prototype.addContent = function (data) {

        if (!data)
            throw new Error("data is not defined");

        this.editPattern("[[" + data + "]]");

        return this;
    };

    HtmlGenerator.prototype.moveUp = function (level) {

        var that = this;

        level = level || 0;

        if (level === 0)
            return;

        var str = "";

        for (var i = 0; i < level; i++) {
            str = str + "^";
        }


        return {
            add: addPattern
        };


        function addPattern(pattern) {
            if (!pattern)
                throw new Error("pattern not defined");

            pattern = that.addExternalEmmetter(pattern);

            that.editPattern(str + pattern);

            return that;
        }


    };

    HtmlGenerator.prototype.addtoNthElement = function (elmNo, pattern) {

        if (!elmNo)
            throw new Error("please provide child element number ");

        this.editPattern("{{" + data + "}}");

        return this;
    };

    HtmlGenerator.prototype.addProtos = function () {

        var args = Array.prototype.slice.call(arguments);

        var that = this;

        args.forEach(function (x, idx) {

            if (!x)
                return;

            if (typeof x === 'object') {

                for (var obj in x) {
                    that.__proto__[obj] = x[obj];
                }

            } else if (typeof x === 'function') {
                that.__proto__[(x.name || 'fun') + idx] = x;
            }


        });

    };

    HtmlGenerator.prototype.add = function () {

        var that = this;

        return {
            sibling: function () {
                return HtmlGenerator.prototype.addSibling.apply(that, arguments);
            },
            child: function () {
                return HtmlGenerator.prototype.addChild.apply(that, arguments);
            },
            byMovingUp: function () {
                return HtmlGenerator.prototype.moveUp.apply(that, arguments);

            },
            content: function (data) {
                that.editPattern("[[" + data + "]]");
                return that;
            }



        };
    };

    var htmlgen = function () {


        var args = Array.prototype.slice.call(arguments);

        var F = function () { };
        F.prototype = HtmlGenerator.prototype;

        var f = new F();

        HtmlGenerator.apply(f, args);

        return f;

    };

    window.HtmlGenerator = htmlgen;


}());