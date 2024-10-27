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
## Yeo Kai Jiun
### UI Testing
(the files listed below are located in the 'tests' folder)
1. **pageNavigation.spec.mjs:**
   - **User flow:** User navigates from the home page to the 'About' page, then to the 'Contact' page, then the 'Privacy Policy' page and finally back to the home page.
   - **Verification:** The UI test verifies that the products and filters are displayed correctly on the home page, and that the links to each page works correctly.
2. **productFilter.spec.mjs:**
   - **User flow:** User filters the products on the home page by price range $0 to 19, then $100 or more, then resets the filters. User then filters by 'Clothing' category and price range $40 to 59.
   - **Verification:** The UI test verifies that the products matching the filters are displayed correctly upon filtering.
3. **productSearch.spec.mjs:**
   - **User flow:** User searches for 'bread' keyword, then searches for 'shirt' keyword, then searches for 'jeans' keyword.
   - **Verification:** The UI test verifies that the matching results for each search are displayed correctly.

### Integration testing
(the files listed below are located in the 'controllers' folder)
1. **filterProductIntegration.test.js:** Testing the integration between filterProductController, productModel and the database by simulating a filter request.
2. **searchProductIntegration.test.js:** Testing the intergration between searchProductController, productModel and the database by simulating a search request.