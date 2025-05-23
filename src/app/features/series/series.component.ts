import { Component, NgModule, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Series } from '../../shared/models/series.model';
import { SeriesCardComponent } from '../../shared/components/series-card/series-card.component';
import { ActivatedRoute } from '@angular/router';
import { SeriesService } from '../../services/series.service';
import { PageEvent } from '@angular/material/paginator';

@Component({
  selector: 'app-series',
  imports: [CommonModule, SeriesCardComponent, FormsModule],
  templateUrl: './series.component.html',
  styleUrls: ['./series.component.scss']
})

export class SeriesComponent implements OnInit {

    genres = [
    { id: 10759, name: 'Action & Adventure' },
    { id: 16, name: 'Animation' },
    { id: 35, name: 'Comedy' },
    { id: 80, name: 'Crime' },
    { id: 99, name: 'Documentary' },
    { id: 18, name: 'Drama' },
    { id: 10751, name: 'Family' },
    { id: 10762, name: 'Kids' },
    { id: 9648, name: 'Mystery' },
    { id: 10763, name: 'News' },
    { id: 10764, name: 'Reality' },
    { id: 10765, name: 'Sci-Fi & Fantasy' },
    { id: 10766, name: 'Soap' },
    { id: 10767, name: 'Talk' },
    { id: 10768, name: 'War & Politics' },
    { id: 37, name: 'Western' }
  ];
  selectedGenres: number[] = [];
  selectedGenresString = "";
  loading = false;
  series: Series[] = [];
  currentPage = 1;
  totalSeries = 0;
  isInViewport = false;
  pageSize = 20;
  maxPages = 1;
  category = "airing_today";

  constructor(private seriesService: SeriesService, private route: ActivatedRoute) {}

  ngOnInit(): void {
      this.loadSeries();

      // Add event listeners to filter-category buttons
      document.querySelectorAll('.filter-category-button').forEach(button => {
        button.addEventListener('click', () => {
          // Remove "active" class from all buttons
          document.querySelectorAll('.filter-category-button').forEach(btn => 
            btn.classList.remove('active')
          );

          // Add "active" class to the clicked button
          button.classList.add('active');
        });
      });
  }

clearGenres(): void
{
  this.selectedGenres = [];
  this.selectedGenresString = "";
  // Clear all checkboxes
  const checkboxes = document.querySelectorAll('.genre-checkbox input') as NodeListOf<HTMLInputElement>;
  checkboxes.forEach(checkbox => checkbox.checked = false);
  this.filterSeries(this.category);
}

// Toggle genre selection
toggleGenre(genreId: number, event: Event) {
  const isChecked = (event.target as HTMLInputElement).checked; 
  if (isChecked) {
    this.selectedGenres.push(genreId);
  } else {
    this.selectedGenres = this.selectedGenres.filter(id => id !== genreId);
  }
  this.filterSeries(this.category);
}


// Get comma-separated string of selected genres
getSelectedGenresString(): string {
  return this.selectedGenres.join('%2C');
}


filterSeries(category: string): void {
    this.loading = true;
    this.currentPage = 1; // Reset to the first page when changing category
    this.maxPages = 1; // Reset max pages
    this.totalSeries = 0; // Reset total series count
    this.series = []; // Clear the current series list
    this.pageSize = 20; // Reset page size
    this.isInViewport = false; // Reset viewport status
    this.category = category;
    this.selectedGenresString = this.getSelectedGenresString();

        this.seriesService.getCertainSeriesWithPagination(this.currentPage,this.selectedGenresString,this.category).subscribe({
          next: (response) => {
            this.series = response.results;
            this.totalSeries = response.total_results;
            this.pageSize = 20;
            this.maxPages = Math.ceil(this.totalSeries / this.pageSize);
            this.loading = false;
          },
          error: (error) => {
            console.error('Error fetching series:', error);
            this.loading = false;
          }
        });
  };



loadSeries(): void {
  this.loading = true;
  this.seriesService.getCertainSeriesWithPagination(this.currentPage,this.selectedGenresString,this.category).subscribe({
    next: (response) => {
      this.series = response.results;
      this.totalSeries = response.total_results;
      this.pageSize = 20;
      this.maxPages = Math.ceil(this.totalSeries / this.pageSize);
      this.loading = false;
    },
    error: (error) => {
      console.error('Error fetching series:', error);
      this.loading = false;
    }
  });
}

goToPreviousPage(): void {
  if (this.currentPage > 1) {
    this.currentPage--;
    this.loadSeries();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}

goToNextPage(): void {
  if (this.currentPage < this.maxPages) {
    this.currentPage++;
    this.loadSeries();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}

  onPageChange(event : PageEvent) : void {
    this.pageSize = event.pageSize;
    this.currentPage = event.pageIndex;
    this.loadSeries();
    window.scrollTo({top:0, behavior: 'smooth'}); 
  }

  onScroll(): void {
      this.loadSeries();
  }
}