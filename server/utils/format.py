def format_date_readable_with_ordinal(dt):
    """ Format a datetime object to a string of the form:
        Friday the 23rd
    """
    day = dt.day
    if 4 <= day <= 20 or 24 <= day <= 30:
        suffix = "th"
    else:
        suffix = ["st", "nd", "rd"][day % 10 - 1]

    return "%s the %s%s" % (dt.strftime("%A"), day, suffix)
