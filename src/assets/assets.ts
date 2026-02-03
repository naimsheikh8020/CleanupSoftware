import logo from "./Clean_Up_logo.png";
import Clients_icon from "./Clients.svg";
import Dashboard_icon from "./Dashboard_icon.svg";
import Employess_icon from "./Employees.svg";
import invoice from "./invoice.svg";
import map from "./map.svg";
import notification from "./notification.svg";
import region from "./Region.svg";
import report from "./report.svg";
import service from "./service.svg";
import setting from "./Setting.svg";
import Avg_Popularity from "./Avg_Popularity.svg";
import AVG_rating from "./Avg_rating.svg";
import Total_revenue from "./Total_revenue.svg";
import total_service from "./total_service.svg";
import Appertment from "./Appertment.svg";
// import Appertment from "./Appertment.svg";
import image1 from "./Home_Image/Image-1.png";
import image2 from "./Home_Image/Image-2.png";
import image3 from "./Home_Image/Image-3.png";
import image4 from "./Home_Image/Image-4.png";
import Background_Image from "./Home_Image/Background_Image.png";
import Color_Background_Image from "./Home_Image/Color_Background.png";
import Regular_Cleaning from "./Home_Image/Regular_Cleaning.png";
import Security from "./Home_Image/Security.png";
import pest_control from "./Home_Image/Pest_Control.png";
import Maintence from "./Home_Image/Maintence.png";
import Landscaping from "./Home_Image/Landscaping.png";
import DeepCleaning from "./Home_Image/Deep_Cleaning.png";
import Help from "./Home_Image/Help.png";
import Client from "./Client-say.jpg";
import Add_Employee from "./Add_Employee.svg";
import Bulk from "./Bulk.svg";
import Refresh from "./Refresh.svg";
import Active from "./Active.svg";
import AvgPerformance from "./AvgPerformance.svg";
import onLeave from "./OnLeave.svg";
import totalEmployee from "./Total Employee.svg";
import totalpayroll from "./Total Payroll.svg";
import blueInvoice from "./Blue_Invoice.svg";
import overDue from "./Overdue.svg";
import Paid_Amount from "./Paid_Amount.svg";
// import correcticon from "./assets/Image/correcticon.svg";
import correcticon from "../assets/Image/correcticon.svg";
import time from "../assets/Image/time.svg";
import cross from "../assets/Image/cross.svg";
import doller from "../assets/Image/i.svg";
import blueDot from "./blueDot.svg"
import calender from "./Calender.svg"
import Clock from "./Clock.svg"
import location from "./Location.svg"
import Delete from "./Delete.svg";
import eye from "./Eye.svg"
import print from "./Print.svg"
import Edit from "./Edit.svg"
import subscriptionss from "./subscriptionss.svg"
import Froms from "./Froms.svg"
import Communication from "./Communication.svg"
import help from "./Help.svg"
import share from "./Share.svg"
import totalTask from "./Total_Task.svg"
import complete from "./Complete.svg"
import in_Progress from "./Inprogress.svg"
import pending from "./Pending.svg"
import Dollar from "./Dollar.svg"
import Download from "./Image/Download.svg"


export const assets = {
  logo,
  calender,
  Froms,
  complete,
  share,
  pending,
  Dollar,
  in_Progress,
  Download,
  subscriptionss,
  eye,
  Communication,
  print,
  Edit,
  help,
  Clock,
  Delete,
  location,
  Clients_icon,
  Dashboard_icon,
  Employess_icon,
  invoice,
  map,
  notification,
  region,
  report,
  service,
  setting,
  Avg_Popularity,
  AVG_rating,
  Total_revenue,
  Appertment,
  total_service,
  image1,
  image2,
  image3,
  image4,
  Background_Image,
  Color_Background_Image,
  Regular_Cleaning,
  Security,
  pest_control,
  Maintence,
  Landscaping,
  DeepCleaning,
  Help,
  Client,
  Add_Employee,
  Bulk,
  Refresh,
  Active,
  AvgPerformance,
  onLeave,
  totalEmployee,
  totalpayroll,
  blueInvoice,
  overDue,
  Paid_Amount,
  correcticon,
  time,
  cross,
  doller,
  blueDot,
  totalTask,

};

export const subscriptionsData = [
  {
    id: 1,
    property: "Apt 304, Sunset Tower",
    owner: "John Smith",
    region: "North Region",
    status: "Active & Paid",
    statusColor: "bg-green-500",
    days: "23 days remaining",
    barColor: "bg-green-400",
    barWidth: "w-[75%]"
  },
  {
    id: 2,
    property: "Apt 102, Ocean View",
    owner: "Sarah Johnson",
    region: "South Region",
    status: "Payment Due — Action Needed",
    statusColor: "bg-yellow-500",
    days: "2 days overdue",
    barColor: "bg-orange-500",
    barWidth: "w-[90%]"
  },
  {
    id: 3,
    property: "Apt 507, Metro Plaza",
    owner: "Mike Davis",
    region: "East Region",
    status: "Paused — 15 days Left",
    statusColor: "bg-blue-500",
    days: "15 days remaining",
    barColor: "bg-blue-500",
    barWidth: "w-[50%]"
  },
  {
    id: 4,
    property: "Apt 201, Sunset Tower",
    owner: "Emma Wilson",
    region: "North Region",
    status: "Stopped Permanently",
    statusColor: "bg-red-500",
    days: "Subscription ended",
    barColor: "bg-red-400",
    barWidth: "w-[100%]"
  }
];


export const ServiceTopCard = [
  {
    title: "Total Service",
    number: 4,
    iconKey: "total_service",
    iconAlt: "total employee",
  },
  { title: "Active", number: 63, iconKey: "Active", iconAlt: "active" },
  {
    title: "Avg Rating",
    number: 4.8,
    iconKey: "AVG_rating",
    iconAlt: "Avg Performance",
  },
  {
    title: "Total Revenue",
    number: 250000,
    iconKey: "Total_revenue",
    iconAlt: "Total_revenue",
  },

];

export const InvoiceTopCard = [
  {
    title: "Total Invoice",
    number: 4,
    iconKey: "blueInvoice",
    iconAlt: "total employee",
  },
  {
    title: "Sales",
    number: 2,
    iconKey: "overDue",
    iconAlt: "Avg Performance",
  },
  {
    title: "Expense",
    number: 200,
    iconKey: "Total_revenue",
    iconAlt: "Total_revenue",
  },
  {
    title: "Total Amount",
    number: 5,
    iconKey: "Paid_Amount",
    iconAlt: "On leave",
  },
];

export const Subscription = [
  {
    title: "Active Subscriptions",
    number: 247,
    iconKey: "time",
    iconAlt: "total employee",
  },
  {
    title: "Pending Renewals",
    number: 18,
    iconKey: "overDue",
    iconAlt: "correcticon",
  },
  {
    title: "Expired",
    number: 12,
    iconKey: "doller",
    iconAlt: "Total_revenue",
  },
  {
    title: "Revenue This Month",
    number: 45680,
    iconKey: "Total_revenue",
    iconAlt: "On leave",
  },
];


export const data = [
  {
    id: 1,
    name: "John Martinez",
    email: "john.martinez@email.com",
    status: "Active",
    location: "Apt 4B, Building A North Region",
    package: "Premium Package $299/month",
    startDate: "Jan 15, 2024",
    countdown: "17 hour Left",
    nextPayment: "Feb 15, 2024",
    invoice: true,
  },
  {
    id: 2,
    name: "Emma Wilson",
    email: "emma.wilson@email.com",
    status: "Pending",
    location: "Apt 2A, Building C South Region",
    package: "Basic Package $149/month",
    startDate: "Dec 20, 2023",
    countdown: "",
    nextPayment: "Jan 20, 2024",
    invoice: false,
  },
  {
    id: 3,
    name: "Michael Chen",
    email: "m.chen@email.com",
    status: "Auto-Renew",
    location: "Apt 1C, Building B East Region",
    package: "Enterprise Package $499/month",
    startDate: "Nov 10, 2023",
    countdown: "17 Days Left",
    nextPayment: "Feb 10, 2024",
    invoice: true,
  },
  {
    id: 4,
    name: "Lisa Anderson",
    email: "lisa.anderson@email.com",
    status: "Expired",
    location: "Apt 3D, Building D West Region",
    package: "Premium Package $299/month",
    startDate: "Oct 5, 2023",
    countdown: "",
    nextPayment: "-",
    invoice: false,
  },
];