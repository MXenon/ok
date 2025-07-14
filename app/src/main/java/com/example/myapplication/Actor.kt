package com.example.myapplication

data class Actor(
    val id: Int,
    val name: String,
    val age: Int,
    val nationality: String,
    val biography: String,
    val imageUrl: String,
    val movies: List<String>
)
