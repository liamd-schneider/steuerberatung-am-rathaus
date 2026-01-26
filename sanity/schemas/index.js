//this page imports all schemas so they can be exported as once file

import appointmentSchema from "./appointment-schema";
import categorySchema from "./category-schema";
import contactSchema from "./contact-schema";
import { customerCounterSchema } from './customerCounter'; // Changed to named import
import formsSchema from "./forms-schema";
import notificationSchema from "./notification-schema";
import { userSchema } from "./user-schema";




const schemas = [contactSchema, userSchema, formsSchema, notificationSchema, appointmentSchema, categorySchema, customerCounterSchema]; // Updated variable name

export default schemas;
