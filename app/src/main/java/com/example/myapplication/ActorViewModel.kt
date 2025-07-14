package com.example.myapplication

import androidx.compose.runtime.State
import androidx.compose.runtime.mutableStateListOf
import androidx.compose.runtime.mutableStateOf
import androidx.lifecycle.ViewModel

class ActorViewModel : ViewModel() {

    private val _actors = mutableStateListOf<Actor>()
    val actors: List<Actor> get() = _actors

    val selectedActor = mutableStateOf<Actor?>(null)
    val showAddDialog = mutableStateOf(false)
    val showEditDialog = mutableStateOf(false)

    init {
        _actors.addAll(
            listOf(
                Actor(1, "Leonardo DiCaprio", 49, "Américain", "Acteur oscarisé connu pour Titanic, Inception...", "https://www.google.com/url?sa=i&url=https%3A%2F%2Fen.wikipedia.org%2Fwiki%2FLeonardo_DiCaprio&psig=AOvVaw30cSu1YhHKGHXDnWRsx5OP&ust=1752548789849000&source=images&cd=vfe&opi=89978449&ved=0CBQQjRxqFwoTCNCQmZKvu44DFQAAAAAdAAAAABAE", listOf("Titanic", "Inception", "The Revenant")),
                Actor(2, "Margot Robbie", 33, "Australienne", "Actrice connue pour Barbie, Suicide Squad...", "", listOf("Barbie", "Suicide Squad", "I, Tonya")),
                Actor(3, "Ryan Gosling", 43, "Canadien", "Acteur polyvalent connu pour La La Land, Blade Runner...", "", listOf("La La Land", "Blade Runner 2049", "Drive")),
                Actor(4, "Emma Stone", 35, "Américaine", "Actrice oscarisée pour La La Land...", "", listOf("La La Land", "Easy A", "Superbad")),
                Actor(5, "Christian Bale", 50, "Britannique", "Acteur transformiste connu pour Batman, Vice...", "", listOf("The Dark Knight", "Vice", "American Psycho")),
                Actor(6, "Scarlett Johansson", 39, "Américaine", "Actrice connue pour Marvel, Lost in Translation...", "", listOf("Black Widow", "Lost in Translation", "Marriage Story"))
            )
        )
    }

    fun selectActor(actor: Actor?) {
        selectedActor.value = actor
    }

    fun showAddDialog() {
        showAddDialog.value = true
    }

    fun hideAddDialog() {
        showAddDialog.value = false
    }

    fun showEditDialog(actor: Actor) {
        selectedActor.value = actor
        showEditDialog.value = true
    }

    fun hideEditDialog() {
        showEditDialog.value = false
    }

    fun addActor(actor: Actor) {
        val newId = _actors.maxByOrNull { it.id }?.id?.plus(1) ?: 1
        _actors.add(actor.copy(id = newId))
    }

    fun updateActor(actor: Actor) {
        val index = _actors.indexOfFirst { it.id == actor.id }
        if (index != -1) {
            _actors[index] = actor
        }
    }

    fun deleteActor(actor: Actor) {
        _actors.removeAll { it.id == actor.id }
    }

}