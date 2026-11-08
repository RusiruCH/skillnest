@echo off
echo ========================================================
echo   SkillNest Group B - Module 01: Course Management
echo   Contributor: L.M.R.C. Bandara (SEU/IS/22/ICT/113)
echo   Repository:  Project-SkillNest-Group-B
echo   Branch:      feature/member-01-course-management
echo ========================================================
echo.

echo Checking Git status...
git status
echo.

echo Pushing feature/member-01-course-management branch to GitHub...
git push origin feature/member-01-course-management

echo.
if %ERRORLEVEL% EQU 0 (
    echo ========================================================
    echo   SUCCESSFULLY PUSHED TO GITHUB!
    echo   Branch: feature/member-01-course-management
    echo   Pull Request: https://github.com/RusiruCH/Project-SkillNest-Group-B/pull/new/feature/member-01-course-management
    echo ========================================================
) else (
    echo.
    echo   If prompted, please complete the GitHub sign-in in your browser window.
)

pause
