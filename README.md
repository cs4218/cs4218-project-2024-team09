[![Review Assignment Due Date](https://classroom.github.com/assets/deadline-readme-button-22041afd0340ce965d47ae6ef1cefeee28c7c493a6346c4f15d667ab976d596c.svg)](https://classroom.github.com/a/Lq2be5ao)
# Instructions on creating team repository using GitHub Classroom
## Step 1. Ensure that your team formation through Canvas has been confirmed.
Do not proceed to step 2 otherwise!

## Step 2. Visit the assignment link at https://classroom.github.com/a/Lq2be5ao
The first member of the team to access this link will be prompted to accept the assignment that gives your team access to the new repository.
Create a new team by typing 2024-TeamXX , where XX is the Team number as noted in Step 1 above. 
(Note that the naming convention must be followed strictly, e.g. capitalisation, dash, and spacing. 
If your group number is a single digit, i.e 2024-Team1 is fine as well.)

The other members in the team will be able to see an existing team with your team number in the “Join an existing team” section. Click Join.

## Step 3. All of you should be able to see the acceptance page. Click on the assignment link to see the project on GitHub.

## Milestone 2 Contributions
## Hoang Huu Chinh
### UI Testing
(the files listed below are located in the 'tests' folder)
1. **adminCreateProduct.spec.mjs: (2 tests)**
   - **User flow:** Admin login with their credentials, then navigate to admin dashboard, categories tab and create new categories or deleting an existing categories
   - **Verification:** Verify the new category created and showed on the UI, the deleting category is could not be found anymore
2. **adminCreateProduct.spec.mjs: (1 tests)**
   - **User flow:** Admin login with their credentials, then navigate to admin dashboard, create product tab and create a new product
   - **Verification:** Verify by 

### Integration testing
(the files listed below are located in the 'pages/admin' folder)
1. **CreateCategory-CategoryForm.test.js:** Testing the integration between CreateCategory and CategoryForm
2. **Users-Layout-AdminMenu.test.js:** Testing the intergration between Users, Layout and Adminmenu

## Yeo Kai Jiun
### UI Testing
(the files listed below are located in the 'tests' folder)
1. **pageNavigation.spec.mjs:**
   - **User flow:** User navigates from the home page to the 'About' page, then to the 'Contact' page, then the 'Privacy Policy' page and finally back to the home page.
   - **Verification:** The UI test verifies that the products and filters are displayed correctly on the home page, and that the links to each page works correctly.
2. **productFilter.spec.mjs:**
   - **User flow:** User filters the products on the home page by price range $0 to 19, then $100 or more, then resets the filters. User then filters by 'Clothing' category and price range $40 to 59.
   - **Verification:** The UI test verifies that the products matching the filters are displayed correctly upon filtering.
   - **NOTE:** This UI test fails non-deterministically due to an observed issue within the project codebase. Specifically, the product filter occasionally requires multiple clicks to function as intended. This behavior has been reproduced manually on the website and aligns with the test failures, indicating that the test fails not because it is inherently flaky but rather due to an issue in the filtering functionality. I have indicated this by labelling test 1 with "BUG:", similar to what I did for certain unit tests in milestone 1.
3. **productSearch.spec.mjs:**
   - **User flow:** User searches for 'bread' keyword, then searches for 'shirt' keyword, then searches for 'jeans' keyword.
   - **Verification:** The UI test verifies that the matching results for each search are displayed correctly.

### Integration testing
(the files listed below are located in the 'controllers' folder)
1. **filterProductIntegration.test.js:** Testing the integration between filterProductController, productModel and the database by simulating a filter request.
2. **searchProductIntegration.test.js:** Testing the intergration between searchProductController, productModel and the database by simulating a search request.

## Chang Si Kai
### UI Testing
(the files listed below are located in the 'tests' folder)
1. **makeUserOrder.spec.mjs:**
   - **User flow:** User logs in, then adds an item to the cart, then pays, then navigates to the Order page.
   - **Verification:** The UI test verifies that the order was successfully placed.
2. **userDashboard.spec.mjs:** 
   - **User flow:** User logs in, then goes to the dashboard.
   - **Verification:** The UI test verifies that the user can see his dashboard, and not admin's dashboard.
3. **updateProfile.spec.mjs:**
   - **User flow:** User logs in, then navigates to dashboard, then navigates to profile, fills up new details for his new name, then goes back to the dashboard.
   - **Verification:** The UI test verifies that the user can update his profile and see the changes reflected in the dashboard and navbar.

### Integration testing
IMPORTANT NOTE: Due to the original code's misconfiguration with Jest, API calls in jestdom environment to the backend made from the frontend cannot be completed, limiting the test's results. As a result, I turned the focus towards the ability to access MongoDB.

In order to run the test cases successfully, you must have an instance of server running in the background, since jest is not configured to proxy requests from frontend to backend.

In OrdersIntegration, there is no workaround as the necessary functions calling the backend API cannot be mocked as they are internal.

(the files listed below are located in the 'client/src/pages/user' folder)
1. **DashboardIntegration.test.js:** Testing the integration between Dashboard and Usermenu, and Dashboard and MongoDB by logging in and checking the dashboard.
2. **OrdersIntegration.test.js:** Testing the integration between Orders and MongoDB by checking if orders are reflected on a user's order page, and if order statuses are reflected after an admin's update.
3. **ProfileIntegration.test.js:** Testing the integration between Profile and MongoDB by checking if profile data are reflected on a user's profile page and if user is able to make changes to their profile.

## William Chau Wei Xuan

Cart Workflow 
- (CartPage (/cart), Categories (/category), CategoriesProduct (/category/:slug), ProductDetails (/product/:slug))

### UI Testing
(the files listed below are located in the 'tests' folder)
1. **cart.spec.mjs: (3 tests)**
   - **User flow 1 (Add & Remove):** 
     - User goes to category, selects one category and then one product and adds it to cart.
     - User then goes to cart and removes the item
     - **Verification 1:** Verify that the item is in the cart, verify that the item has been removed from the cart
   - **User flow 2 (Add, Login, Pay):**
     - User goes to adds an item to cart and goes to the cart page
     - User is made to login and logins to pay
     - **Verification 2:** Verify that that user is able to pay
   - **User flow 3 (Browsing):**
     - User browses items by category and is able to see the details of each item without buying
     - **Verification 3:** Verify that the item details are present and that each category has the products present

### Integration testing
(the files listed below are located in the 'pages' folder)
- **CartFlow.integration.js:** Testing the integration of pages involved in the Cart workflow (CartPage, Categories, CategoriesProduct, ProductDetails)
   1. Tests that ProductDetails is able to call API successfully to display the specific details
   2. Tests that ProductDetails is able to call API successfully to display similar products
   3. Tests that CartPage is able to call API successfully for payment
   4. Tests that Categories is able to call API successfully to display all categories
   5. Tests that CategoriesProduct is able to call API successfully to display all Products
   5a. (All tests fail as client API calls are missing server address)

## Milestone 3 Contributions (Performance Testing)
## Yeo Kai Jiun
### Peak load performance testing
Peak load test plan that simulates 1,000 users trying to register new accounts concurrently over a ramp-up period of 3 seconds.

The relevant files, including the mock register credentials data, are located in:
`performance-tests/registerUser-peak-performance-test/*`

## Hoang Huu Chinh
### Load testing `creatProduct`
Using Jmeter test plan to simulates 100 diffent admins creating 10 products per admin simutaneously over ramp-up period of 5 seconds.

The relevant files, including the mock register credentials data, are located in:
`performance-tests/adminCreateProduct/*`

## Chang Si Kai
### Login stress testing 
Login stress test plan that simulates users logging in concurrently within 1 second. As JMeter does not have a function yet to programmtically ramp up the number of users per run and aggregate the data, we have to set the number of users, run the tests, analyse the results to look for any failures, then increase the number of users and repeat until failure occurs.

The relevant files, including the mock register credentials data, are located in:
`performance-tests/loginUser-stress-performance-test/*`
