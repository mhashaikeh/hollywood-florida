function getNextWorkDays4Workflow(daysAhead, jsStartDate) {
    var index = 0;
    var days = [];
    var stDate
    if (!jsStartDate) {
        stDate = new Date();
    } else {
        stDate = convertDate(jsStartDate);
    }

    var c = java.util.Calendar.getInstance();
    c.setTime(stDate);
    while (index < daysAhead) {
        c.add(java.util.Calendar.DATE, 1);
        var checkDate = c.getTime();
        var isWorkingDay = true;
        var eventByDate = new com.accela.calendar.dao.CalendarEventDAOOracle().getEventByTypeNDate(aa.getServiceProviderCode(), checkDate, "WORKFLOW");
        var checkDay = eventByDate == null || eventByDate.size() == 0;
        if (checkDay) {
            days.push(new Date(checkDate.getTime()));
            index += 1;
        }
    }

    if (days.length > 0) {
        var latestDate = days.sort(function (a, b) {
            return b - a;
        })[0];

        return dateFormatted((latestDate.getMonth() + 1), latestDate.getDate(), latestDate.getFullYear(), "MM/dd/yyyy");
    } else {
        return dateFormatted((stDate.getMonth() + 1), stDate.getDate(), stDate.getFullYear(), "MM/dd/yyyy");
    }
}