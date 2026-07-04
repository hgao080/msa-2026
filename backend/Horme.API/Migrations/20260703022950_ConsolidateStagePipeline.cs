using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Horme.API.Migrations
{
    /// <inheritdoc />
    public partial class ConsolidateStagePipeline : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "CreatedAt",
                table: "ApplicationStages",
                type: "TEXT",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<DateTime>(
                name: "OfferedAt",
                table: "Applications",
                type: "TEXT",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "WithdrawnAt",
                table: "Applications",
                type: "TEXT",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "CreatedAt",
                table: "ApplicationStages");

            migrationBuilder.DropColumn(
                name: "OfferedAt",
                table: "Applications");

            migrationBuilder.DropColumn(
                name: "WithdrawnAt",
                table: "Applications");
        }
    }
}
