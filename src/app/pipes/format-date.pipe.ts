import { Pipe, PipeTransform } from "@angular/core";

/**
 *  recieves a string value, if format mm/dd/yyyy is correct checks the difference between today and said date
 *  returns a string of how many days weeks or month ago was the recieved date
 */

@Pipe({
    standalone: true,
    name: 'formatDate'
})
export class FormatDatePipe implements PipeTransform {
    transform(value: string) {

        var date_regex = /^(0[1-9]|1[0-2])\/(0[1-9]|1\d|2\d|3[01])\/(19|20)\d{2}$/;
        if (!(date_regex.test(value))) {
            return value;
        }

        const difference = this.getDifference(value);

        if (difference > 2) {
            if (difference > 7 ) {
                if (difference > 30) {
                    return `${Math.floor(difference / 30)} months ago`; 
                }
                return `${Math.floor(difference / 7)} weeks ago`;
            } else {
                return `${difference} days ago`;
            }
        }

        return 'Now';
    }

    getDifference(value: string): number {

        const today = new Date();
        const createdAt = new Date(value);
        
        const todayUTC = Date.UTC(today.getFullYear(), today.getMonth(), today.getDate());
        const createdAtUTC = Date.UTC(createdAt.getFullYear(), createdAt.getMonth(), createdAt.getDate());

        return Math.floor((todayUTC - createdAtUTC) / (1000 * 60 * 60 * 24));
    }
}