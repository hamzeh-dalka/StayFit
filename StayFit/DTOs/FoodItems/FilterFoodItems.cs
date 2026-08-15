namespace StayFit.DTOs.FoodItems
{
    public class FilterFoodItems
    {
        public string? Name { get; set; }
        public int PageNumber { get; set; } = 1;
        public int PageSize { get; set; } = 20;
    }
}
