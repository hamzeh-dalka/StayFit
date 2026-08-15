using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace StayFit.Migrations
{
    /// <inheritdoc />
    public partial class S2 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Goals_ClientProfiles_ClientProfileId",
                table: "Goals");

            migrationBuilder.DropForeignKey(
                name: "FK_MealItems_FoodItems_FoodItemId",
                table: "MealItems");

            migrationBuilder.DropForeignKey(
                name: "FK_Meals_ClientProfiles_ClientProfileId",
                table: "Meals");

            migrationBuilder.DropForeignKey(
                name: "FK_PlanExerciseItems_Exercises_ExerciseId",
                table: "PlanExerciseItems");

            migrationBuilder.DropForeignKey(
                name: "FK_PlanMealItems_FoodItems_FoodItemId",
                table: "PlanMealItems");

            migrationBuilder.DropForeignKey(
                name: "FK_WeightLogs_ClientProfiles_ClientProfileId",
                table: "WeightLogs");

            migrationBuilder.DropForeignKey(
                name: "FK_WorkoutLogItems_Exercises_ExerciseId",
                table: "WorkoutLogItems");

            migrationBuilder.DropForeignKey(
                name: "FK_WorkoutLogs_ClientProfiles_ClientProfileId",
                table: "WorkoutLogs");

            migrationBuilder.AddForeignKey(
                name: "FK_Goals_ClientProfiles_ClientProfileId",
                table: "Goals",
                column: "ClientProfileId",
                principalTable: "ClientProfiles",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_MealItems_FoodItems_FoodItemId",
                table: "MealItems",
                column: "FoodItemId",
                principalTable: "FoodItems",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Meals_ClientProfiles_ClientProfileId",
                table: "Meals",
                column: "ClientProfileId",
                principalTable: "ClientProfiles",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_PlanExerciseItems_Exercises_ExerciseId",
                table: "PlanExerciseItems",
                column: "ExerciseId",
                principalTable: "Exercises",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_PlanMealItems_FoodItems_FoodItemId",
                table: "PlanMealItems",
                column: "FoodItemId",
                principalTable: "FoodItems",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_WeightLogs_ClientProfiles_ClientProfileId",
                table: "WeightLogs",
                column: "ClientProfileId",
                principalTable: "ClientProfiles",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_WorkoutLogItems_Exercises_ExerciseId",
                table: "WorkoutLogItems",
                column: "ExerciseId",
                principalTable: "Exercises",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_WorkoutLogs_ClientProfiles_ClientProfileId",
                table: "WorkoutLogs",
                column: "ClientProfileId",
                principalTable: "ClientProfiles",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Goals_ClientProfiles_ClientProfileId",
                table: "Goals");

            migrationBuilder.DropForeignKey(
                name: "FK_MealItems_FoodItems_FoodItemId",
                table: "MealItems");

            migrationBuilder.DropForeignKey(
                name: "FK_Meals_ClientProfiles_ClientProfileId",
                table: "Meals");

            migrationBuilder.DropForeignKey(
                name: "FK_PlanExerciseItems_Exercises_ExerciseId",
                table: "PlanExerciseItems");

            migrationBuilder.DropForeignKey(
                name: "FK_PlanMealItems_FoodItems_FoodItemId",
                table: "PlanMealItems");

            migrationBuilder.DropForeignKey(
                name: "FK_WeightLogs_ClientProfiles_ClientProfileId",
                table: "WeightLogs");

            migrationBuilder.DropForeignKey(
                name: "FK_WorkoutLogItems_Exercises_ExerciseId",
                table: "WorkoutLogItems");

            migrationBuilder.DropForeignKey(
                name: "FK_WorkoutLogs_ClientProfiles_ClientProfileId",
                table: "WorkoutLogs");

            migrationBuilder.AddForeignKey(
                name: "FK_Goals_ClientProfiles_ClientProfileId",
                table: "Goals",
                column: "ClientProfileId",
                principalTable: "ClientProfiles",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_MealItems_FoodItems_FoodItemId",
                table: "MealItems",
                column: "FoodItemId",
                principalTable: "FoodItems",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Meals_ClientProfiles_ClientProfileId",
                table: "Meals",
                column: "ClientProfileId",
                principalTable: "ClientProfiles",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_PlanExerciseItems_Exercises_ExerciseId",
                table: "PlanExerciseItems",
                column: "ExerciseId",
                principalTable: "Exercises",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_PlanMealItems_FoodItems_FoodItemId",
                table: "PlanMealItems",
                column: "FoodItemId",
                principalTable: "FoodItems",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_WeightLogs_ClientProfiles_ClientProfileId",
                table: "WeightLogs",
                column: "ClientProfileId",
                principalTable: "ClientProfiles",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_WorkoutLogItems_Exercises_ExerciseId",
                table: "WorkoutLogItems",
                column: "ExerciseId",
                principalTable: "Exercises",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_WorkoutLogs_ClientProfiles_ClientProfileId",
                table: "WorkoutLogs",
                column: "ClientProfileId",
                principalTable: "ClientProfiles",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
