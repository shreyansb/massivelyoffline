sole.templates = sole.templates || {};

sole.templates.results_row = '\
    <div class="sole_timing">\
    {{#timing}}\
        {{date}}<br/>\
        {{time}}\
    {{/timing}}\
    </div>\
    \
    <div class="sole_people">\
        {{#students}}\
        <img src="{{{img}}}">\
        {{/students}}\
        \
        <div class="join_sole">\
        </div>\
    </div>\
';
