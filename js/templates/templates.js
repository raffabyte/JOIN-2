const EDIT_SVG = `<svg width="19" height="19" viewBox="0 0 19 19" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M2 17H3.4L12.025 8.375L10.625 6.975L2 15.6V17ZM16.3 6.925L12.05 2.725L13.45 1.325C13.8333 0.941667 14.3042 0.75 14.8625 0.75C15.4208 0.75 15.8917 0.941667 16.275 1.325L17.675 2.725C18.0583 3.10833 18.2583 3.57083 18.275 4.1125C18.2917 4.65417 18.1083 5.11667 17.725 5.5L16.3 6.925ZM14.85 8.4L4.25 19H0V14.75L10.6 4.15L14.85 8.4Z" fill="#2A3647"/></svg>`; 
const DELETE_SVG = `<svg width="16" height="18" viewBox="0 0 16 18" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3 18C2.45 18 1.97917 17.8042 1.5875 17.4125C1.19583 17.0208 1 16.55 1 16V3C0.716667 3 0.479167 2.90417 0.2875 2.7125C0.0958333 2.52083 0 2.28333 0 2C0 1.71667 0.0958333 1.47917 0.2875 1.2875C0.479167 1.09583 0.716667 1 1 1H5C5 0.716667 5.09583 0.479167 5.2875 0.2875C5.47917 0.0958333 5.71667 0 6 0H10C10.2833 0 10.5208 0.0958333 10.7125 0.2875C10.9042 0.479167 11 0.716667 11 1H15C15.2833 1 15.5208 1.09583 15.7125 1.2875C15.9042 1.47917 16 1.71667 16 2C16 2.28333 15.9042 2.52083 15.7125 2.7125C15.5208 2.90417 15.2833 3 15 3V16C15 16.55 14.8042 17.0208 14.4125 17.4125C14.0208 17.8042 13.55 18 13 18H3ZM3 3V16H13V3H3ZM5 13C5 13.2833 5.09583 13.5208 5.2875 13.7125C5.47917 13.9042 5.71667 14 6 14C6.28333 14 6.52083 13.9042 6.7125 13.7125C6.90417 13.5208 7 13.2833 7 13V6C7 5.71667 6.90417 5.47917 6.7125 5.2875C6.52083 5.09583 6.28333 5 6 5C5.71667 5 5.47917 5.09583 5.2875 5.2875C5.09583 5.47917 5 5.71667 5 6V13ZM9 13C9 13.2833 9.09583 13.5208 9.2875 13.7125C9.47917 13.9042 9.71667 14 10 14C10.2833 14 10.5208 13.9042 10.7125 13.7125C10.9042 13.5208 11 13.2833 11 13V6C11 5.71667 10.9042 5.47917 10.7125 5.2875C10.5208 5.09583 10.2833 5 10 5C9.71667 5 9.47917 5.09583 9.2875 5.2875C9.09583 5.47917 9 5.71667 9 6V13Z" fill="#2A3647"/></svg>`;
const CLOSE_CANCEL_SVG = `<svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M7 8.40005L2.1 13.3C1.91667 13.4834 1.68333 13.575 1.4 13.575C1.11667 13.575 0.883333 13.4834 0.699999 13.3C0.516666 13.1167 0.424999 12.8834 0.424999 12.6C0.424999 12.3167 0.516666 12.0834 0.699999 11.9L5.6 7.00005L0.699999 2.10005C0.516666 1.91672 0.424999 1.68338 0.424999 1.40005C0.424999 1.11672 0.516666 0.883382 0.699999 0.700049C0.883333 0.516715 1.11667 0.425049 1.4 0.425049C1.68333 0.425049 1.91667 0.516715 2.1 0.700049L7 5.60005L11.9 0.700049C12.0833 0.516715 12.3167 0.425049 12.6 0.425049C12.8833 0.425049 13.1167 0.516715 13.3 0.700049C13.4833 0.883382 13.575 1.11672 13.575 1.40005C13.575 1.68338 13.4833 1.91672 13.3 2.10005L8.4 7.00005L13.3 11.9C13.4833 12.0834 13.575 12.3167 13.575 12.6C13.575 12.8834 13.4833 13.1167 13.3 13.3C13.1167 13.4834 12.8833 13.575 12.6 13.575C12.3167 13.575 12.0833 13.4834 11.9 13.3L7 8.40005Z" fill="#2A3647"></path></svg>`; 
const SUBMIT_SVG = `<svg width="16" height="12" viewBox="0 0 16 12" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M5.79911 9.15L14.2741 0.675C14.4741 0.475 14.7116 0.375 14.9866 0.375C15.2616 0.375 15.4991 0.475 15.6991 0.675C15.8991 0.875 15.9991 1.1125 15.9991 1.3875C15.9991 1.6625 15.8991 1.9 15.6991 2.1L6.49911 11.3C6.29911 11.5 6.06578 11.6 5.79911 11.6C5.53245 11.6 5.29911 11.5 5.09911 11.3L0.799113 7C0.599113 6.8 0.50328 6.5625 0.511613 6.2875C0.519946 6.0125 0.624113 5.775 0.824113 5.575C1.02411 5.375 1.26161 5.275 1.53661 5.275C1.81161 5.275 2.04911 5.375 2.24911 5.575L5.79911 9.15Z" fill="#2A3647"/></svg>`;
const SUBMIT_LIGHT_SVG = `<svg width="16" height="12" viewBox="0 0 16 12" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M5.79911 9.15L14.2741 0.675C14.4741 0.475 14.7116 0.375 14.9866 0.375C15.2616 0.375 15.4991 0.475 15.6991 0.675C15.8991 0.875 15.9991 1.1125 15.9991 1.3875C15.9991 1.6625 15.8991 1.9 15.6991 2.1L6.49911 11.3C6.29911 11.5 6.06578 11.6 5.79911 11.6C5.53245 11.6 5.29911 11.5 5.09911 11.3L0.799113 7C0.599113 6.8 0.50328 6.5625 0.511613 6.2875C0.519946 6.0125 0.624113 5.775 0.824113 5.575C1.02411 5.375 1.26161 5.275 1.53661 5.275C1.81161 5.275 2.04911 5.375 2.24911 5.575L5.79911 9.15Z" fill="white"/></svg>`;
const HIGH_PRIORITY_SVG = `<svg width="18" height="12" viewBox="0 0 18 12" fill="none" xmlns="http://www.w3.org/2000/svg"><g clip-path="url(#clip0_338179_5960)"><path d="M9.00026 4.75476C9.19969 4.75443 9.39397 4.81633 9.55451 4.93137L17.123 10.3653C17.2215 10.4361 17.3046 10.525 17.3678 10.627C17.4309 10.7291 17.4727 10.8422 17.4909 10.9599C17.5276 11.1977 17.4656 11.4399 17.3186 11.6333C17.1716 11.8266 16.9516 11.9553 16.7071 11.9909C16.4625 12.0266 16.2134 11.9664 16.0145 11.8234L9.00026 6.7925L1.98602 11.8234C1.88754 11.8942 1.7757 11.9454 1.65687 11.9742C1.53803 12.0029 1.41455 12.0086 1.29345 11.9909C1.17235 11.9733 1.05602 11.9326 0.951088 11.8712C0.846159 11.8099 0.754691 11.729 0.681906 11.6333C0.609122 11.5375 0.556445 11.4288 0.526885 11.3132C0.497325 11.1977 0.491459 11.0776 0.509623 10.9599C0.527789 10.8422 0.569626 10.7291 0.632752 10.627C0.695876 10.525 0.779049 10.4361 0.877524 10.3653L8.44602 4.93137C8.60656 4.81633 8.80083 4.75443 9.00026 4.75476Z" fill="#FF3D00"/><path d="M9.00002 -0.000121266C9.19945 -0.000455511 9.39372 0.0614475 9.55427 0.176482L17.1228 5.61045C17.3216 5.75336 17.454 5.96724 17.4907 6.20502C17.5273 6.4428 17.4654 6.68501 17.3184 6.87837C17.1714 7.07173 16.9514 7.20039 16.7068 7.23606C16.4623 7.27173 16.2131 7.21147 16.0143 7.06856L9.00002 2.03761L1.98577 7.06856C1.78689 7.21147 1.53777 7.27173 1.2932 7.23606C1.04863 7.20039 0.828657 7.07173 0.681662 6.87837C0.534667 6.68501 0.472695 6.4428 0.509379 6.20502C0.546065 5.96723 0.678402 5.75336 0.87728 5.61044L8.44577 0.176482C8.60631 0.0614474 8.80059 -0.000455546 9.00002 -0.000121266Z" fill="#FF3D00"/></g><defs><clipPath id="clip0_338179_5960"><rect width="17" height="12" fill="white" transform="translate(17.5 12) rotate(-180)"/></clipPath></defs></svg>`;
const MID_PRIORITY_SVG = `<svg width="18" height="8" viewBox="0 0 18 8" fill="none" xmlns="http://www.w3.org/2000/svg"><g clip-path="url(#clip0_338179_5876)"><path d="M16.5685 7.16658L1.43151 7.16658C1.18446 7.16658 0.947523 7.06773 0.772832 6.89177C0.598141 6.71581 0.5 6.47716 0.5 6.22831C0.5 5.97947 0.598141 5.74081 0.772832 5.56485C0.947523 5.38889 1.18446 5.29004 1.43151 5.29004L16.5685 5.29004C16.8155 5.29004 17.0525 5.38889 17.2272 5.56485C17.4019 5.74081 17.5 5.97947 17.5 6.22831C17.5 6.47716 17.4019 6.71581 17.2272 6.89177C17.0525 7.06773 16.8155 7.16658 16.5685 7.16658Z" fill="#FFA800"/><path d="M16.5685 2.7098L1.43151 2.7098C1.18446 2.7098 0.947523 2.61094 0.772832 2.43498C0.598141 2.25902 0.5 2.02037 0.5 1.77152C0.5 1.52268 0.598141 1.28403 0.772832 1.10807C0.947523 0.932105 1.18446 0.833252 1.43151 0.833252L16.5685 0.833252C16.8155 0.833252 17.0525 0.932105 17.2272 1.10807C17.4019 1.28403 17.5 1.52268 17.5 1.77152C17.5 2.02037 17.4019 2.25902 17.2272 2.43498C17.0525 2.61094 16.8155 2.7098 16.5685 2.7098Z" fill="#FFA800"/></g><defs><clipPath id="clip0_338179_5876"><rect width="17" height="6.33333" fill="white" transform="translate(0.5 0.833252)"/></clipPath></defs></svg>`;
const LOW_PRIORITY_SVG = `<svg width="18" height="12" viewBox="0 0 18 12" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M8.99974 7.24524C8.80031 7.24557 8.60603 7.18367 8.44549 7.06863L0.876998 1.63467C0.778524 1.56391 0.695351 1.47498 0.632227 1.37296C0.569103 1.27094 0.527264 1.15784 0.5091 1.0401C0.472414 0.802317 0.534386 0.560105 0.681381 0.366747C0.828377 0.17339 1.04835 0.0447247 1.29292 0.00905743C1.53749 -0.0266099 1.78661 0.0336422 1.98549 0.176559L8.99974 5.2075L16.014 0.17656C16.1125 0.105795 16.2243 0.0545799 16.3431 0.02584C16.462 -0.00289994 16.5855 -0.00860237 16.7066 0.00905829C16.8277 0.0267189 16.944 0.0673968 17.0489 0.128769C17.1538 0.190142 17.2453 0.271007 17.3181 0.366748C17.3909 0.462489 17.4436 0.571231 17.4731 0.686765C17.5027 0.802299 17.5085 0.922362 17.4904 1.0401C17.4722 1.15784 17.4304 1.27094 17.3672 1.37296C17.3041 1.47498 17.221 1.56391 17.1225 1.63467L9.55398 7.06863C9.39344 7.18367 9.19917 7.24557 8.99974 7.24524Z" fill="#7AE229"/><path d="M8.99998 12.0001C8.80055 12.0005 8.60628 11.9386 8.44574 11.8235L0.877242 6.38955C0.678366 6.24664 0.546029 6.03276 0.509344 5.79498C0.472658 5.5572 0.53463 5.31499 0.681625 5.12163C0.828621 4.92827 1.0486 4.79961 1.29317 4.76394C1.53773 4.72827 1.78686 4.78853 1.98574 4.93144L8.99998 9.96239L16.0142 4.93144C16.2131 4.78853 16.4622 4.72827 16.7068 4.76394C16.9514 4.79961 17.1713 4.92827 17.3183 5.12163C17.4653 5.31499 17.5273 5.5572 17.4906 5.79498C17.4539 6.03276 17.3216 6.24664 17.1227 6.38956L9.55423 11.8235C9.39369 11.9386 9.19941 12.0005 8.99998 12.0001Z" fill="#7AE229"/></svg>`;
const CHECKBOX_SVG = `<svg class="checkbox" width="25" height="25" viewBox="0 0 25 25" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="4.68213" y="4.39673" width="16" height="16" rx="3" stroke="#2A3647" stroke-width="2"/></svg>`; 
const CHECKBOX_FILLED_LIGHT_SVG = `<svg class="checkbox-filled display-none" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M20 11V17C20 18.6569 18.6569 20 17 20H7C5.34315 20 4 18.6569 4 17V7C4 5.34315 5.34315 4 7 4H15" stroke="white" stroke-width="2" stroke-linecap="round"/><path d="M8 12L12 16L20 4.5" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
const CHECKBOX_FILLED_DARK_SVG = `<svg width="25" height="25" viewBox="0 0 25 25" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M20.6821 11.3967V17.3967C20.6821 19.0536 19.339 20.3967 17.6821 20.3967H7.68213C6.02527 20.3967 4.68213 19.0536 4.68213 17.3967V7.39673C4.68213 5.73987 6.02527 4.39673 7.68213 4.39673H15.6821" stroke="#2A3647" stroke-width="2" stroke-linecap="round"/><path d="M8.68213 12.3967L12.6821 16.3967L20.6821 4.89673" stroke="#2A3647" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
const PLUS_SVG =`<svg width="15" height="14" viewBox="0 0 15 14" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M6.24854 8H1.24854C0.965202 8 0.727702 7.90417 0.536035 7.7125C0.344368 7.52083 0.248535 7.28333 0.248535 7C0.248535 6.71667 0.344368 6.47917 0.536035 6.2875C0.727702 6.09583 0.965202 6 1.24854 6H6.24854V1C6.24854 0.716667 6.34437 0.479167 6.53604 0.2875C6.7277 0.0958333 6.9652 0 7.24854 0C7.53187 0 7.76937 0.0958333 7.96104 0.2875C8.1527 0.479167 8.24854 0.716667 8.24854 1V6H13.2485C13.5319 6 13.7694 6.09583 13.961 6.2875C14.1527 6.47917 14.2485 6.71667 14.2485 7C14.2485 7.28333 14.1527 7.52083 13.961 7.7125C13.7694 7.90417 13.5319 8 13.2485 8H8.24854V13C8.24854 13.2833 8.1527 13.5208 7.96104 13.7125C7.76937 13.9042 7.53187 14 7.24854 14C6.9652 14 6.7277 13.9042 6.53604 13.7125C6.34437 13.5208 6.24854 13.2833 6.24854 13V8Z" fill="#2A3647"/></svg>`;
const SEPARATOR_SVG  =`<svg width="2" height="24" viewBox="0 0 2 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M1 0V24" stroke="#D1D1D1"/></svg>`;
const BOARD_SVG =`<svg width="31" height="26" viewBox="0 0 31 26" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M23.4544 2.77273L23.4545 23.2271C23.4538 23.8296 23.2142 24.4074 22.7881 24.8334C22.362 25.2595 21.7843 25.4992 21.1817 25.4998L16.6363 25.4998C16.0338 25.4992 15.456 25.2595 15.03 24.8334C14.6039 24.4074 14.3642 23.8296 14.3636 23.2271L14.3636 2.77273C14.3642 2.17015 14.6039 1.59243 15.03 1.16635C15.456 0.740262 16.0338 0.500623 16.6363 0.50002L21.1817 0.50002C21.7843 0.500623 22.362 0.740262 22.7881 1.16635C23.2142 1.59243 23.4538 2.17015 23.4544 2.77273ZM16.6363 23.2271L21.1817 23.2271L21.1817 2.77273L16.6363 2.77273L16.6363 23.2271ZM16.6363 2.77273L16.6363 23.2271C16.6357 23.8296 16.3961 24.4073 15.97 24.8334C15.5439 25.2595 14.9662 25.4991 14.3636 25.4997L9.81823 25.4997C9.21566 25.4991 8.63794 25.2595 8.21185 24.8334C7.78577 24.4073 7.54613 23.8296 7.54553 23.227L7.54553 2.7727C7.54613 2.17013 7.78577 1.59241 8.21185 1.16632C8.63793 0.740238 9.21566 0.500602 9.81823 0.5L14.3636 0.499999C14.9662 0.500602 15.5439 0.740238 15.97 1.16632C16.3961 1.59241 16.6357 2.17015 16.6363 2.77273ZM9.81823 23.227L14.3636 23.2271L14.3636 2.77273L9.81823 2.7727L9.81823 23.227ZM9.81823 2.7727L9.81823 23.227C9.81763 23.8296 9.57799 24.4073 9.15191 24.8334C8.72582 25.2595 8.1481 25.4991 7.54553 25.4997L3.00012 25.4997C2.39755 25.4991 1.81983 25.2595 1.39374 24.8334C0.967657 24.4073 0.728019 23.8296 0.727417 23.227L0.727416 2.7727C0.728018 2.17013 0.967656 1.59241 1.39374 1.16632C1.81982 0.740238 2.39755 0.500603 3.00012 0.5L7.54553 0.5C8.1481 0.500602 8.72582 0.740238 9.1519 1.16632C9.57799 1.59241 9.81763 2.17013 9.81823 2.7727ZM3.00012 23.227L7.54553 23.227L7.54553 2.7727L3.00012 2.7727L3.00012 23.227Z" fill="white"/><path d="M30.2726 2.77298L30.2726 23.2273C30.272 23.8299 30.0323 24.4076 29.6062 24.8337C29.1802 25.2598 28.6024 25.4994 27.9999 25.5L23.4545 25.5C22.8519 25.4994 22.2742 25.2598 21.8481 24.8337C21.422 24.4076 21.1824 23.8296 21.1817 23.2271L21.1817 2.77273C21.1823 2.17015 21.422 1.59268 21.8481 1.1666C22.2742 0.740514 22.8519 0.500876 23.4544 0.500274L27.9999 0.500273C28.6024 0.500876 29.1801 0.740514 29.6062 1.1666C30.0323 1.59268 30.272 2.1704 30.2726 2.77298ZM23.4545 23.2271L27.9999 23.2273L27.9999 2.77298L23.4544 2.77273L23.4545 23.2271Z" fill="white"/></svg>`;

/**
 * Template für eine Drag-Area in einer Board-Spalte
 * @param {string} dragAreaId - Die ID der Drag-Area
 * @returns {string} HTML-Template für die Drag-Area
 */
function dragAreaTemplate(dragAreaId) {
    return `<div class="drag-area display-none" id="${dragAreaId}"></div>`;
}


function header() {
    const pagesToHideUserInfo = [
        'legal-notice.html',
        'privacy.html',
        'legal-notice-login.html',
        'privacy-login.html'
    ];
    const hideHelpLinkPages = [
        'help.html'
    ];
    const currentPage = window.location.pathname.split('/').pop();

    const hideUserInfo = pagesToHideUserInfo.includes(currentPage);
    const hideInfoHeader = hideHelpLinkPages.includes(currentPage);

    return `
        <h3>Kanban Project Management Tool</h3>
        <img class="joinM" src="../img/Capa 3.png" alt="">
        <div class="userInfo flexR gap-16 ${hideUserInfo ? 'hidden-userinfo' : ''}">
            <a href="help.html" id="helpLink" class="${hideInfoHeader ? 'hidden-userinfo' : ''}">
                <img class="help" src="../img/SummaryUser/help.png" alt="" />
            </a>
            <button onclick="toggleMenu()" id="userProfile" class="initials-button">
                <img src="../img/Ellipse 3.png" alt="">
                <span id="userInitials" class="initials-text"></span>
            </button>
            <div class="flexC not-visible" id="menu">
                <a class="helpMobileLink" href="help.html">Help</a>

<a href="../index/legal-notice.html"
   onclick="closeMenu(); hardNavigate(event, this.href)">Legal notice</a>

<a href="../index/privacy.html"
   onclick="closeMenu(); hardNavigate(event, this.href)">Privacy Policy</a>

<a onclick="logout()" href="login.html">Log Out</a>

            </div>
        </div>
    `;
}
// === Header Helpers (nur 1x deklarieren) ===
if (!window.toggleMenu) {
  window.toggleMenu = function () {
    const menu = document.getElementById('menu');
    if (!menu) return;
    menu.classList.toggle('not-visible');
  };
}

if (!window.closeMenu) {
  window.closeMenu = function () {
    const menu = document.getElementById('menu');
    if (!menu) return;
    menu.classList.add('not-visible');
  };
}

/**
 * Erzwinge Navigation, selbst wenn andere Click-Handler preventDefault() aufrufen.
 * Lässt das href trotzdem stehen (Accessibility, Kontextmenü, Mittelklick etc.).
 */
if (!window.hardNavigate) {
  window.hardNavigate = function (ev, href) {
    try {
      if (ev) ev.preventDefault();
      // optional: ev.stopPropagation(); falls ein Parent-Handler stört
    } catch (_) {}
    // harte Navigation
    window.location.assign(href);
  };
}


function linkesNav(activePage) {
  const isGuest = localStorage.getItem("guestMode") === "true";

  const privacyHref = "../index/privacy.html";
  const legalHref = "../index/legal-notice.html";

  return `
    <div class="flexC nav-menu-top">
      <img class="join" src="../img/fav-icon.png" alt="">
      <div class="width-100 flexC menu">
        <a href="summary.html" class="flexR menuOption${activePage === 'summary' ? ' aktiveNav' : ''}">
          <img class="icon" src="../img/summary.png" alt="">
          <p>Summary</p>
        </a>
        <a href="addTask.html" class="menuOption flexR${activePage === 'addTask' ? ' aktiveNav' : ''}">
          <img class="icon" src="../img/add-tasks.png" alt="">
          <p>Add Task</p>
        </a>
        <a href="board.html" class="menuOption flexR${activePage === 'board' ? ' aktiveNav' : ''}">
          <img class="icon" src="../img/Board.png" alt="">
          <p>Board</p>
        </a>
        <a href="contacts.html" class="menuOption flexR${activePage === 'contacts' ? ' aktiveNav' : ''}">
          <img class="icon" src="../img/contacts.png" alt="">
          <p>Contacts</p>
        </a>
      </div>
    </div>
    <div class="legalLinks">
      <a href="${privacyHref}" class="privacyPolicy${activePage === 'privacy' ? ' aktiveNav' : ''}">Privacy Policy</a>
      <a href="${legalHref}" class="legalNotice${activePage === 'legal-notice' ? ' aktiveNav' : ''}">Legal notice</a>
    </div>
  `;
}

function linkesNavLogin(activePage) {
    return `
    <div class="login-menu flexC">
        <img class="join" src="../img/fav-icon.png" alt="">
        <a onclick="logout()" href="../index/login.html" class="login-link flexR">
            <img class="icon" src="../img/LogIn/login-arrow.png" alt="login">
            <p>Log in</p>
        </a>

    </div>
    <div class="legalLinks flexC">
        <a href="../index/privacy-login.html" class="privacyPolicy ${activePage === 'privacy' || activePage === 'privacy-login' ? ' aktiveNav' : ''}">Privacy Policy</a>
        <a href="../index/legal-notice-login.html" class="legalNotice ${activePage === 'legal-notice' || activePage === 'legal-notice-login' ? ' aktiveNav' : ''}">Legal notice</a>
    </div>`
}

function taskCardTemplate(task) {
    return `
        <div class="task-card width-100 flexC" id="${task.id}"
              onclick="if(window.__mobileDragging){window.__mobileDragging=false; return false;} taskOverlay('${task.id}')"
              draggable="true" ondragstart="startDragging(event, '${task.id}')"
              ondragend="stopDragging(event, '${task.id}')"
              ontouchstart="this._lpt=setTimeout(()=>{ window.__mobileDragging=true; try{ startDragging({dataTransfer:{setDragImage:()=>{}}}, '${task.id}'); }catch(e){ /* fallback */ currentDraggedElement='${task.id}'; this.classList.add('dragging'); } }, 250)"
              ontouchmove="if(window.__mobileDragging){ const t=event.touches[0]; const el=document.elementFromPoint(t.clientX,t.clientY); const col=el && el.closest('.board-column-bottom'); const map={todoColumn:'toDoDragArea', inProgressColumn:'inProgressDragArea', awaitFeedbackColumn:'awaitingFeedbackDragArea', doneColumn:'doneDragArea'}; Object.keys(map).forEach(k=>{ if(!col || k!==col.id) removeHighlight(map[k]); }); if(col && map[col.id]){ highlight(map[col.id]); } event.preventDefault(); }"
              ontouchend="clearTimeout(this._lpt); if(window.__mobileDragging){ const t=(event.changedTouches && event.changedTouches[0]) || (event.touches && event.touches[0]); if(t){ const el=document.elementFromPoint(t.clientX,t.clientY); const col=el && el.closest('.board-column-bottom'); if(col && col.id){ moveTo(col.id); } else { stopDragging(); ['toDoDragArea','inProgressDragArea','awaitingFeedbackDragArea','doneDragArea'].forEach(id=>removeHighlight(id)); } } event.preventDefault(); setTimeout(()=>{window.__mobileDragging=false;}, 250); }"
              ontouchcancel="clearTimeout(this._lpt); if(window.__mobileDragging){ stopDragging(); ['toDoDragArea','inProgressDragArea','awaitingFeedbackDragArea','doneDragArea'].forEach(id=>removeHighlight(id)); setTimeout(()=>{window.__mobileDragging=false;}, 250); }">
            <div class="task-card-header width-100 flexR">
                <span id="${convertToCamelCase(task.category)}">${task.category}</span>
            </div>
            <h3>${task.title}</h3>
            <p class="task-description ${getVisibilityClass(task.description)}" id="taskDescription">${task.description}</p>
            <div class="subtasks flexR ${getVisibilityClass(Array.isArray(task.subtasks) && task.subtasks.length > 0)}" id="subtasks">
                ${generateSubtaskProgress(task.subtasks)}
            </div>
            <div class="space-between flexR ${getVisibilityClass(taskHasFooterData(task))}">
                <div class="task-members width-100 flexR ${getVisibilityClass(Array.isArray(task.assignee) && task.assignee.length > 0)}" id="taskMembers">
                    ${renderMembers(task)}
                </div>
                <div class="${getVisibilityClass(task.priority)} task-priority width-100 flexR">
                    ${getPrioritySvg(task.priority)}
                </div>
            </div>
        </div>`;
}

function noTaskCardTemplate(columnName) {
    return `
        <div class="no-task-item flexR width-100">
            <p>No tasks ${columnName}</p>
        </div>`;
}

function noSearchResultsTemplate() {
    return `
            <div class="no-results assignee-option width-100 flexR space-between" style="opacity: 0.6; cursor: default;">
                <div class="gap-16 flexR">
                    <span class="contact-icon flexR" style="background-color: #ccc;">?</span>
                    <span class="contact-name">Not found</span>
                </div>
            </div>`;
}


function extraCountSpanTemplate(count) {
    return `<span class="contact-icon extra-count flexR">+${count}</span>`;
}

function contactIconSpanTemplate(name) {
    const color = getContactColor(name);
    return `
    <span class="contact-icon flexR" data-name="${name}" style="background-color: ${color};">${contactIconSpan(name)}</span>`;
}



function handleSubtasksTemplate(progress, done, total) {
  return `
        <div class="width-100 space-between flexR">
            <div class="progress-bar-container width-100">
                <div class="progress-bar-fill" style="width: ${progress}%;"></div>
            </div>
            <span class="progress-text">${done}/${total} Subtasks</span>
        </div>
    `
}

function memberNameTemplate(name) {
    return `<span class="member-name-text">${name}</span>`;
}

function memberWithNameTemplate(name){
    return `
        <div class="member-with-name width-100 flexR gap-16">
          ${contactIconSpanTemplate(name)}  
          ${memberNameTemplate(name)}
        </div>`;
}

function taskOverlayTemplate(task){
    return `
        <div class="flexC gap-24 task-overlay-content width-100" id="taskOverlayContent" data-task-id="${task.id}">
            <div class="space-between flexR">
                <span class="task-category" id="${convertToCamelCase(task.category)}">${task.category}</span>
                <button class="overlay-button" onclick="closeOverlay()">
                    ${CLOSE_CANCEL_SVG}
                </button>
            </div>
            <div class="task-overlay-header gap-24 flexC">
                <h2>${task.title}</h2>
                <p class="${getVisibilityClass(task.description)}" id="taskOverlayDescription">${task.description || ''}</p>
                <div class="gap-25 flexR">
                    <p class="task-overlay-headdings">Due Date:</p>
                    ${formatDate(task.dueDate)}
                </div>
                <div class="flexR gap-25 ${getVisibilityClass(task.priority)}">
                    <p class="task-overlay-headdings">Priority:</p>
                    <div class="flexR overlay-priority">
                        ${handlePriority(task.priority)} 
                        ${getPrioritySvg(task.priority)}
                    </div>
                </div>
                <div class="assignee-container gap-8 flexC ${getVisibilityClass(task.assignee)}">
                    <p class="task-overlay-headdings">Assignees:</p>
                    <div class="flexC width-100">
                    ${renderMembersWithName(task)}
                    </div>
                </div>
                <div class="gap-8 flexC subtasks-overlay ${getVisibilityClass(task.subtasks)}">   
                    <p class="task-overlay-headdings">Subtasks:</p>
                    <div class="subtasks-overlay-list flexC width-100">
                        ${task.subtasks && task.subtasks.length > 0 ? task.subtasks.map(subtask => `
                            <div class="subtask-item-overlay gap-16 flexR">
                                <button class="checkbox" onclick="toggleSubtask('${task.id}', '${subtask.value}')">
                                    ${subtask.checked ? CHECKBOX_FILLED_DARK_SVG : CHECKBOX_SVG}
                                </button>
                                <span>${subtask.value}</span>
                            </div>
                        `).join('') : '<p>No subtasks available</p>'}
                    </div>
                </div>
            </div>
            <div class="task-overlay-footer gap-8 flexR">
                <button class="task-footer-btn gap-8 flexR" onclick="deleteTask('${task.id}')">${DELETE_SVG} Delete</button>
                ${SEPARATOR_SVG}
                <button class="task-footer-btn gap-8 flexR" onclick="editTask('${task.id}')">${EDIT_SVG} Edit</button>
            </div>
        </div>
        ${editTaskOverlayTemplate(task)}
        `;
}

function taskEditTemplate(task) {
    return `
        <div class="flexC width-100 gap-24">
            <div class="gap-8 width-100 flexC">
                <label class="width-100" for="editedTaskTitle">Title</label>
                <input class="inputs change-onfoucus requierd-input" oninput="hideValidationErrors()" type="text" id="editedTaskTitle" value="${task.title}" placeholder="Enter a title" >
                <span class="required-span width-100 display-none">This field is required</span>
            </div>
            <div class="gap-8 width-100 flexC">
                <label class="width-100" for="editedTaskDescription">Description</label>
                <textarea class="inputs change-onfoucus" id="editedTaskDescription" name="taskDescription" placeholder="Enter Task description">${task.description || ''}</textarea>
            </div>
            <div class="gap-8 width-100 flexC">
                <label class="width-100" for="editedTaskDueDate">Due date<span class="highlight">*</span></label>
                <input class="inputs change-onfoucus requierd-input" value="${task.dueDate ? task.dueDate.split('T')[0] : ''}" type="date" id="editedTaskDueDate" name="taskDueDate" min="" onfocus="this.min=new Date().toISOString().split('T')[0]">
                <span class="required-span width-100 display-none">This field is required</span>
            </div>
            <div class="gap-8 width-100 flexC">
                <span class="width-100 prio-style">Priority</span>
                <div class="flexR priority-select width-100 gap-16">
                    <button type="button" class="edit-priority-button gap-8 width-100 flexR HighPriority ${task.priority === 'HighPriority' ? 'active' : ''}" 
                            onclick="PriorityHandler('high'); event.stopPropagation();">
                        <span class="priority-text">Urgent</span>
                        ${HIGH_PRIORITY_SVG}
                    </button>
                    <button type="button" class="edit-priority-button gap-8 width-100 flexR MidPriority ${task.priority === 'MidPriority' ? 'active' : ''}" 
                            onclick="PriorityHandler('medium'); event.stopPropagation();">
                        <span class="priority-text">Medium</span>
                        ${MID_PRIORITY_SVG}
                    </button>
                    <button type="button" class="edit-priority-button gap-8 width-100 flexR LowPriority ${task.priority === 'LowPriority' ? 'active' : ''}" 
                            onclick="PriorityHandler('low'); event.stopPropagation();">
                        <span class="priority-text">Low</span>
                        ${LOW_PRIORITY_SVG}
                    </button>
                </div>
            </div>
            <div class="flexC gap-8 width-100">
                <label class="width-100" for="editedTaskAssignee">Assigned To</label>
                <div class="input-svg-wrapper width-100 flexC">
                    <input  class="inputs change-onfoucus" oninput="toggleAssigneeOptions()" type="text" id="editedTaskAssignee" placeholder="Select Contacts to assign"
                            onclick="toggleAssigneeOptions(); event.stopPropagation(); ">
                    <div id="assigneeOptions" class="assignee-options width-100 display-none">
                        <!-- Dynamically generated assignee options will be inserted here -->
                    </div>
                </div>
                <div class="selected-assignee width-100 gap-8 flexR ${task.assignee && task.assignee.length > 0 ? '' : 'display-none'}" id="editedAssignee">
                    ${task.assignee && task.assignee.length > 0 ? task.assignee.map(name => contactIconSpanTemplate(name)).join('') : ''}
                </div>
            </div>
            <div class="gap-8 width-100 flexC">
                <label class="width-100" for="editedSubtasks">Subtasks</label>
                <div class="inputs change-onfoucus space-between flexR" id="inputBox">
                    <input type="text" id="editedSubtasks" placeholder="add new subtask" oninput="checkSubtask(this.value.length)" onfocus="showAddCancelBtns()" onkeydown="onEnterAddSubTask(event, 'editedSubtasks')">
                    <button class="plus-button overlay-button" id="subtaskPlusBtn" type="button" onclick="showAddCancelBtns()">
                            ${PLUS_SVG}
                    </button>
                    <div class="add-cancel-btns flexR display-none gap-8" id="addCancelBtns">
                        <button class="cancel-subtask-button overlay-button" type="button" onclick="cancelSubtask()">
                            ${CLOSE_CANCEL_SVG}
                        </button>
                        ${SEPARATOR_SVG}
                        <button class="add-subtask-button overlay-button" type="button" onclick="addSubtask('editedSubtasks')">
                            ${SUBMIT_SVG}
                        </button>
                    </div>
                </div>
                <span id="subtaskHintMessage" class="width-100 display-none">Please type a clear subtask</span>
                <ul class="flexC width-100 ${task.subtasks && task.subtasks.length > 0 ? '' : 'display-none'}" id="editedSubtasksList">
                    ${task.subtasks && Array.isArray(task.subtasks) ? task.subtasks.map((subtask, index) => addSubTaskTemplate(subtask.value, index)).join('') : ''}
                </ul>
            </div>
        </div>`;
}

function editTaskOverlayTemplate(task) {
    return `
    <div class="display-none flexC gap-24 width-100" id="taskEditForm">
        <div class="flexR width-100 flex-end">
            <button class="overlay-button" onclick="closeOverlay()">
                    ${CLOSE_CANCEL_SVG}
            </button>
        </div>
        <div class="flexC edit-task-div width-100 gap-24">
            ${taskEditTemplate(task)}
        </div>
        <div class="flexR width-100 flex-end">
            <button class="submit-edit btn-shadow" onclick="submitEdit()">
                Ok
                ${SUBMIT_LIGHT_SVG}
            </button>
        </div>
    </div>`;
}

function assigneeOptionTemplate(contact) {
    const color = getContactColor(contact.name);
    return`
                    <div class="assignee-option width-100 flexR space-between" onclick="selectAssignee(this)">
                        <div class="gap-16 flexR">
                            <span class="contact-icon flexR" style="background-color: ${color};">${contactIconSpan(contact.name)}</span> 
                            <span class="contact-name">${contact.name}</span>
                        </div>
                        ${CHECKBOX_SVG}
                        ${CHECKBOX_FILLED_LIGHT_SVG}
                    </div>
                `
}

// ------------------ contacts --------------------

function getOwnContactCardHtml(contact, initials) {
    return `
    <div class="ownContactCircle" border: 2px solid black;">
      ${initials}
    </div>
    <div>
      <p class="contactName">${contact.name}</p>
    </div>
  `;
}

function getOwnContactCardDetailsHtml(contact) {
    return `
    <div class="displayFlex">
      <div class="ownBigContactCircle">
        ${contact.name.split(" ").map(w => w[0].toUpperCase()).join("").substring(0, 2)}
      </div>
      <div class="displayColumn">
        <h2 class="contectName">${contact.name}</h2>
        <div class="displayFlex1">
          <div class="editContainer" id="ownEditButton">
            <svg width="24" height="24" viewBox="0 0 33 32" fill="none" xmlns="http://www.w3.org/2000/svg">
<mask id="mask0_334068_6285" style="mask-type:alpha" maskUnits="userSpaceOnUse" x="0" y="0" width="33" height="32">
<rect x="0.5" width="32" height="32" fill="#D9D9D9"/>
</mask>
<g mask="url(#mask0_334068_6285)">
<path d="M7.16667 25.3332H9.03333L20.5333 13.8332L18.6667 11.9665L7.16667 23.4665V25.3332ZM26.2333 11.8998L20.5667 6.29984L22.4333 4.43317C22.9444 3.92206 23.5722 3.6665 24.3167 3.6665C25.0611 3.6665 25.6889 3.92206 26.2 4.43317L28.0667 6.29984C28.5778 6.81095 28.8444 7.42761 28.8667 8.14984C28.8889 8.87206 28.6444 9.48873 28.1333 9.99984L26.2333 11.8998ZM24.3 13.8665L10.1667 27.9998H4.5V22.3332L18.6333 8.19984L24.3 13.8665Z" fill="#2A3647"/>
</g>
</svg>
            <p class="pSmall">Edit</p>
          </div>
        </div>
      </div>
    </div>
    <p class="contactInformation">Contact Information</p>
    <div class="displayColumn1">
      <p class="strong">Email</p>
      <p class="mailInfoSmall">${contact.email}</p>
    </div>
    <div class="displayColumn1">
      <p class="strong">Phone</p>
      <p class="phoneInfoSmall">${contact.phone}</p>
    </div>
  `;
}

function getContendCardHtml(contact, initials, color) {
    return `
      <div class="contactCircle" style="background-color: ${color};">${initials}</div>
      <div>
        <p class="contactName">${contact.name}</p>
        <p class="contactMail">${contact.email}</p>
      </div>
    `;
}

function getContentCardDetailsHtml(contact, key) {
    return `
  <div class="displayFlex">
  <div class="BigContactCircle" <div class="BigContactCircle" style="background-color: ${
    contact.color
  };">
  ${contact.name
    .split(" ")
    .map((w) => w[0].toUpperCase())
    .join("")
    .substring(0, 2)}

</div>
  <div class="displayColumn">
    <h2 class="contectName">${contact.name}</h2>
    <div onclick="editContact('${key}')" class="displayFlex1">
      <div class="editContainer">
        <svg width="24" height="24" viewBox="0 0 33 32" fill="none" xmlns="http://www.w3.org/2000/svg">
<mask id="mask0_334068_6285" style="mask-type:alpha" maskUnits="userSpaceOnUse" x="0" y="0" width="33" height="32">
<rect x="0.5" width="32" height="32" fill="#D9D9D9"/>
</mask>
<g mask="url(#mask0_334068_6285)">
<path d="M7.16667 25.3332H9.03333L20.5333 13.8332L18.6667 11.9665L7.16667 23.4665V25.3332ZM26.2333 11.8998L20.5667 6.29984L22.4333 4.43317C22.9444 3.92206 23.5722 3.6665 24.3167 3.6665C25.0611 3.6665 25.6889 3.92206 26.2 4.43317L28.0667 6.29984C28.5778 6.81095 28.8444 7.42761 28.8667 8.14984C28.8889 8.87206 28.6444 9.48873 28.1333 9.99984L26.2333 11.8998ZM24.3 13.8665L10.1667 27.9998H4.5V22.3332L18.6333 8.19984L24.3 13.8665Z" fill="#2A3647"/>
</g>
</svg>
        <p class="pSmall">Edit</p>
      </div>
      <div onclick="event.stopPropagation(); deleteContact('${key}')" class="DeleteContainer">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<mask id="mask0_336135_3940" style="mask-type:alpha" maskUnits="userSpaceOnUse" x="0" y="0" width="24" height="24">
<rect width="24" height="24" fill="#D9D9D9"/>
</mask>
<g mask="url(#mask0_336135_3940)">
<path d="M7 21C6.45 21 5.97917 20.8042 5.5875 20.4125C5.19583 20.0208 5 19.55 5 19V6C4.71667 6 4.47917 5.90417 4.2875 5.7125C4.09583 5.52083 4 5.28333 4 5C4 4.71667 4.09583 4.47917 4.2875 4.2875C4.47917 4.09583 4.71667 4 5 4H9C9 3.71667 9.09583 3.47917 9.2875 3.2875C9.47917 3.09583 9.71667 3 10 3H14C14.2833 3 14.5208 3.09583 14.7125 3.2875C14.9042 3.47917 15 3.71667 15 4H19C19.2833 4 19.5208 4.09583 19.7125 4.2875C19.9042 4.47917 20 4.71667 20 5C20 5.28333 19.9042 5.52083 19.7125 5.7125C19.5208 5.90417 19.2833 6 19 6V19C19 19.55 18.8042 20.0208 18.4125 20.4125C18.0208 20.8042 17.55 21 17 21H7ZM7 6V19H17V6H7ZM9 16C9 16.2833 9.09583 16.5208 9.2875 16.7125C9.47917 16.9042 9.71667 17 10 17C10.2833 17 10.5208 16.9042 10.7125 16.7125C10.9042 16.5208 11 16.2833 11 16V9C11 8.71667 10.9042 8.47917 10.7125 8.2875C10.5208 8.09583 10.2833 8 10 8C9.71667 8 9.47917 8.09583 9.2875 8.2875C9.09583 8.47917 9 8.71667 9 9V16ZM13 16C13 16.2833 13.0958 16.5208 13.2875 16.7125C13.4792 16.9042 13.7167 17 14 17C14.2833 17 14.5208 16.9042 14.7125 16.7125C14.9042 16.5208 15 16.2833 15 16V9C15 8.71667 14.9042 8.47917 14.7125 8.2875C14.5208 8.09583 14.2833 8 14 8C13.7167 8 13.4792 8.09583 13.2875 8.2875C13.0958 8.47917 13 8.71667 13 9V16Z" fill="#2A3647"/>
</g>
</svg>
        <p class="pSmall">Delete</p>
      </div>
    </div>
  </div>
</div>
<p class="contactInformation">Contact Information</p>
<div class="displayColumn1">
<p class="strong">Email</p>
<p class="mailInfoSmall">${contact.email}</p>
</div>
<div class="displayColumn1">
<p class="strong">Phone</p>
<p class="phoneInfoSmall"> ${contact.phone}</p>
</div>
  `;
}